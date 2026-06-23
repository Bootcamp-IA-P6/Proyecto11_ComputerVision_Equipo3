"""
Script de entrenamiento YOLOv8s para detección de logos.
Dataset: Logo Detection Clean v3 (Dimitar Dimitrov) - CC BY 4.0
Resultados obtenidos: mAP50 = 0.863

Uso en local (con GPU NVIDIA):
    uv run python training/train_yolov8.py

Uso en Colab:
    Ver notebooks/training_yolo_V2.ipynb
"""

import os

from ultralytics import YOLO

DATASET_PATH = "data/processed/data.yaml"
MODELS_PATH = "models"
os.makedirs(MODELS_PATH, exist_ok=True)


def train():
    model = YOLO("yolov8s.pt")
    results = model.train(
        data=DATASET_PATH,
        epochs=50,
        imgsz=640,
        batch=16,
        device=0,
        project=MODELS_PATH,
        name="logo-detection-v1",
        patience=10,
        save=True,
        plots=True,
    )
    print(f"mAP@50: {results.results_dict['metrics/mAP50(B)']:.3f}")


if __name__ == "__main__":
    train()
