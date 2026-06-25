"""
Backend API para detección de logos en imágenes y vídeos.
"""

import io
import os
import tempfile
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

from app.api.videos import router as videos_router
from app.inference.detector import load_model, predict_image
from app.inference.video_processor import process_video

STORAGE_DIR = Path(__file__).resolve().parent / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(
    title="Logo Detection API",
    description="Detecta logos de marcas en imágenes y vídeos usando YOLO11s",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/storage", StaticFiles(directory=str(STORAGE_DIR)), name="storage")
app.include_router(videos_router)


def intervals_to_detections(intervals: list) -> list:
    return [
        {
            "brand_name": item["brand_name"],
            "start_time": item["start_time"],
            "end_time": item["end_time"],
            "confidence": item.get("avg_confidence", item.get("confidence", 0)),
            "crop_path": item.get("crop_path"),
            "bounding_box": item.get("bounding_box", [0, 0, 0, 0]),
        }
        for item in intervals
    ]


def persist_video_analysis(video_name: str, duration: float, detections: list) -> int | None:
    try:
        from app.db.connection import SessionLocal
        from app.db import crud

        if SessionLocal is None:
            return None

        db = SessionLocal()
        try:
            video = crud.create_video_record(db, video_name)
            video.duration_seconds = duration
            db.commit()
            db.refresh(video)

            db_detections = [
                {
                    "brand_name": d["brand_name"],
                    "start_time": d["start_time"],
                    "end_time": d["end_time"],
                    "confidence": d["confidence"],
                    "crop_path": d.get("crop_path") or "",
                    "bounding_box": d.get("bounding_box") or [0, 0, 0, 0],
                }
                for d in detections
            ]
            if db_detections:
                crud.save_video_analysis_results(db, video.video_id, db_detections)
            return video.video_id
        finally:
            db.close()
    except Exception as exc:
        print(f"Persistencia en BD omitida: {exc}")
        return None


@app.get("/")
def root():
    return {"status": "ok", "message": "Logo Detection API running"}


@app.get("/health")
def health():
    return {"status": "healthy", "model": "yolo11s"}


@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    detections = predict_image(image)

    return {
        "filename": file.filename,
        "detections": detections,
        "total": len(detections),
    }


@app.post("/detect/video")
async def detect_video(
    file: UploadFile = File(...),
    sample_fps: int = 2,
    gap_tolerance: float = 1.0,
):
    if not file.filename or not file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
        raise HTTPException(status_code=400, detail="Formato de vídeo no soportado")

    contents = await file.read()
    suffix = Path(file.filename).suffix or ".mp4"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = process_video(tmp_path, sample_fps, gap_tolerance)
    finally:
        os.unlink(tmp_path)

    detections = intervals_to_detections(result["intervals"])
    unique_name = f"{file.filename}_{int(time.time())}"
    video_id = persist_video_analysis(unique_name, result["duration_seconds"], detections)

    if video_id is None:
        video_id = str(uuid.uuid4())[:8]

    return {
        "video_id": video_id,
        "video_name": file.filename,
        "duration_seconds": result["duration_seconds"],
        "frames_analyzed": result["frames_analyzed"],
        "processing_time_s": result["processing_time_s"],
        "total_brands": result["total_brands"],
        "detections": detections,
        "intervals": result["intervals"],
        "frame_detections": result.get("frame_detections", []),
    }
