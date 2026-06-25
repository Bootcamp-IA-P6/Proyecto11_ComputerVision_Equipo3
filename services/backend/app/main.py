"""
Backend API para detección de logos en imágenes.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io

from app.inference.detector import predict_image, load_model

app = FastAPI(
    title="Logo Detection API",
    description="Detecta logos de marcas en imágenes usando YOLO11s",
    version="1.0.0"
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
