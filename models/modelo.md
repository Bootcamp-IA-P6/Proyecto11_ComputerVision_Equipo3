# Modelo — Logo Detection

## Modelos entrenados

### Modelo A — Andrés (modelo principal)
- Arquitectura: YOLO11s
- Pesos base: yolo11s.pt (preentrenado en COCO)
- Dataset: Logo Detection Clean v3 — 20% (~4.400 imágenes train)
- Épocas: 20 (early stopping, patience=10)
- Batch size: 16 · Resolución: 640×640
- Hardware: NVIDIA RTX 4080 Laptop GPU (12GB) — local

### Modelo B — Maryori (referencia Colab)
- Arquitectura: YOLOv8s
- Pesos base: yolov8s.pt (preentrenado en COCO)
- Dataset: Logo Detection Clean v3 — 100% (14.721 imágenes train)
- Épocas: 50 completas (4.8 horas)
- Batch size: 16 · Resolución: 640×640
- Hardware: Tesla T4 — Google Colab

## Métricas comparativas (set de validación — 1.481 imágenes)

| Métrica | Modelo A (principal) | Modelo B (referencia) |
|---|---|---|
| mAP@50 | **0.891** | 0.863 |
| mAP@50-95 | **0.722** | 0.531 |
| Precisión | **0.806** | 0.782 |
| Recall | 0.916 | **0.919** |

## Métricas por clase — Modelo A (principal)

| Marca | mAP@50 | Precisión | Recall |
|---|---|---|---|
| Under Armour | 0.978 | 0.935 | 0.944 |
| Starbucks | 0.959 | 0.868 | 0.991 |
| Apple Inc | 0.960 | 0.945 | 0.973 |
| The North Face | 0.944 | 0.930 | 1.000 |
| Mercedes-Benz | 0.941 | 0.880 | 0.978 |
| NFL | 0.924 | 0.853 | 0.948 |
| Hard Rock Cafe | 0.937 | 0.753 | 0.988 |
| Toyota | 0.890 | 0.841 | 0.862 |
| Puma | 0.881 | 0.766 | 0.887 |
| Adidas | 0.868 | 0.631 | 0.947 |
| Coca-Cola | 0.865 | 0.823 | 0.872 |
| Chanel | 0.834 | 0.768 | 0.797 |
| Pepsi | 0.818 | 0.737 | 0.727 |
| Emirates | 0.794 | 0.632 | 0.921 |
| Nike | 0.765 | 0.721 | 0.904 |

## Pesos
- Modelo A: `models/logo-detection-v1-2/weights/best.pt`
  (excluido de git — compartir por Google Drive)
- Modelo B: Google Drive — `MyDrive/logo-detection/logo-detection-v1/weights/best.pt`
  (Maryori)

## Observaciones
- Nike y Emirates tienen el mAP@50 más bajo — usar vídeos con logos
  claramente visibles para la demo
- Adidas tiene precisión baja (0.631) — detecta bien pero genera
  algunos falsos positivos
- El Modelo A supera al B en mAP@50 usando solo el 20% del dataset
  gracias a la arquitectura más moderna (YOLO11s vs YOLOv8s)