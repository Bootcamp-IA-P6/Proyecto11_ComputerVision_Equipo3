# Model Documentation
> Elaborado por: MaryoriCruz (V2)

## Model
- Architecture: YOLOv8s (small)
- Base weights: yolov8s.pt (pretrained on COCO)
- Training: fine-tuning via transfer learning

## Training Configuration
- Epochs: 50
- Image size: 640x640
- Batch size: 16
- Device: GPU T4 (Google Colab)
- Early stopping patience: 10

## Results (Validation set)
| Class | mAP50 |
|---|---|
| **All classes** | **0.863** |
| Adidas | 0.830 |
| Coca-Cola | 0.852 |
| Nike | 0.744 |
| Starbucks | 0.958 |
| The North Face | 0.950 |
| Under Armour | 0.955 |

## Acceptance Criteria
- [x] mAP50 > 0.70 ✅ (obtenido: 0.863)
- [x] Weights saved in models/ (excluded from git)
- [x] Reproducible training script in training/train.py
- [x] Metrics documented in docs/modelo.md

## Weights
- File: best.pt
- Location: Google Drive — logo-detection/logo-detection-v1/weights/best.pt
- Git: excluded via .gitignore (too large)