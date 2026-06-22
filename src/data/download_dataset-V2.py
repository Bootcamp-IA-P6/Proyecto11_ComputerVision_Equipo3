# src/data/download_dataset.py
"""
Script para descargar el dataset desde Roboflow Universe.
Dataset: Logo Detection Clean (Dimitar Dimitrov)
URL: https://universe.roboflow.com/dimitar-dimitrov-qnnci/logo-detection-clean
Licencia: CC BY 4.0
Clases usadas: Nike, Adidas, Coca-Cola (+ 12 marcas más disponibles)

Uso:
    En local:  uv run python src/data/download_dataset.py
    En Colab:  ejecutar celda correspondiente en notebooks/training.ipynb
"""

import os
from roboflow import Roboflow
from dotenv import load_dotenv

load_dotenv()

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
DATASET_PATH = "data/processed"

def download_dataset():
    rf = Roboflow(api_key=ROBOFLOW_API_KEY)
    project = rf.workspace("dimitar-dimitrov-qnnci").project("logo-detection-clean")
    version = project.version(3)
    dataset = version.download("yolov8", location=DATASET_PATH)
    print(f"Dataset descargado en: {DATASET_PATH}")
    print(f"Clases disponibles: {dataset.classes}")

if __name__ == "__main__":
    download_dataset()