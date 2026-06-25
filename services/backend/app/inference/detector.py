"""
Módulo de inferencia para detección de logos.
Carga el modelo YOLO11s desde HuggingFace y ejecuta predicciones.
"""

from ultralytics import YOLO
from huggingface_hub import hf_hub_download
from PIL import Image
import numpy as np
import os

MODEL_REPO = "Marco13423/logo-detection-yolo11s"
MODEL_FILE = "best.pt"
MODEL_LOCAL = "models/best.pt"

_model = None

def load_model():
    global _model
    if _model is not None:
        return _model
    
    os.makedirs("models", exist_ok=True)
    
    if not os.path.exists(MODEL_LOCAL):
        print("Descargando modelo desde HuggingFace...")
        path = hf_hub_download(repo_id=MODEL_REPO, filename=MODEL_FILE)
        import shutil
        shutil.copy(path, MODEL_LOCAL)
        print(f"✅ Modelo guardado en {MODEL_LOCAL}")
    
    _model = YOLO(MODEL_LOCAL)
    print("✅ Modelo cargado")
    return _model


def predict_image(image: Image.Image) -> dict:
    model = load_model()
    
    img_array = np.array(image)
    frame_height, frame_width = img_array.shape[:2]
    
    results = model(img_array)[0]
    
    detections = []
    for box in results.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        brand_name = model.names[class_id]
        
        detections.append({
            "brand_name":   brand_name,
            "confidence":   round(confidence, 4),
            "bounding_box": [int(x1), int(y1), int(x2), int(y2)],
            "frame_width":  frame_width,
            "frame_height": frame_height,
        })
    
    return detections
