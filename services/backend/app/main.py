"""
Backend API for logo detection in images and videos.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import tempfile
import os
from contextlib import asynccontextmanager

from app.inference.detector import predict_image, load_model
from app.inference.video_processor import process_video

# Define lifespan to load the model securely at startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Logic to execute when the server starts
    load_model()
    yield
    # Logic to execute when the server shuts down (if needed)

app = FastAPI(
    title="Logo Detection API",
    description="Detects brand logos in images and videos using YOLO11s",
    version="2.0.0",
    lifespan=lifespan  # Pass the lifespan context manager here
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Logo Detection API running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    # Validate that the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

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
    # Validate video format
    if not file.filename.endswith((".mp4", ".avi", ".mov", ".mkv")):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    contents = await file.read()

    # Save to a temporary file for processing
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # Process the video using the processor module
        result = process_video(tmp_path, sample_fps, gap_tolerance)
    finally:
        # Ensure temporary file is cleaned up
        os.unlink(tmp_path)

    return JSONResponse(content={
        "filename":          file.filename,
        "duration_seconds":  result["duration_seconds"],
        "frames_analyzed":   result["frames_analyzed"],
        "processing_time_s": result["processing_time_s"],
        "total_brands":      result["total_brands"],
        "intervals":         result["intervals"],
    })