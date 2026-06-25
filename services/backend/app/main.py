"""
Backend API para detección de logos en imágenes y vídeos.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import tempfile
import os

from app.inference.detector import predict_image, load_model
from app.inference.video_processor import process_video

app = FastAPI(
    title="Logo Detection API",
    description="Detecta logos de marcas en imágenes y vídeos usando YOLO11s",
    version="2.0.0"
)

@app.on_event("startup")
async def startup_event():
    load_model()

@app.get("/")
def root():
    return {"status": "ok", "message": "Logo Detection API running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    detections = predict_image(image)

    return JSONResponse(content={
        "filename":   file.filename,
        "detections": detections,
        "total":      len(detections)
    })

@app.post("/detect/video")
async def detect_video(
    file: UploadFile = File(...),
    sample_fps: int = 2,
    gap_tolerance: float = 1.0
):
    if not file.filename.endswith((".mp4", ".avi", ".mov", ".mkv")):
        raise HTTPException(status_code=400, detail="Formato de vídeo no soportado")

    contents = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = process_video(tmp_path, sample_fps, gap_tolerance)
    finally:
        os.unlink(tmp_path)

    return JSONResponse(content={
        "filename":          file.filename,
        "duration_seconds":  result["duration_seconds"],
        "frames_analyzed":   result["frames_analyzed"],
        "processing_time_s": result["processing_time_s"],
        "total_brands":      result["total_brands"],
        "intervals":         result["intervals"],
    })
