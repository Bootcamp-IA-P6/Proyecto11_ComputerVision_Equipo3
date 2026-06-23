# Dataset Documentation

## Source
- **Name:** Logo Detection Clean
- **Author:** Dimitar Dimitrov
- **URL:** https://universe.roboflow.com/dimitar-dimitrov-qnnci/logo-detection-clean
- **License:** CC BY 4.0
- **Version used:** v3

## Statistics
- Total images: 17,194
- Total bounding boxes: 21,350
- Classes: 15
- Split: train 14,721 / valid 1,481 / test 992

## Classes used in this project
| Class | Detections |
|---|---|
| Adidas | 1,945 |
| Nike | 1,925 |
| Coca-Cola | 1,654 |

## EDA Findings
- Corrupt images: 0
- Unmatched pairs: 0
- Class imbalance ratio: 1.8x ✅
- Small boxes (<2% image): 14,947 — normal for real-world logo detection
- Large boxes (>50% image): 49 — negligible
- Duplicate images: 0 ✅

## Notes
- Dataset already annotated in YOLOv8 format
- Augmentation already applied (x3) by Roboflow
- Recommended training parameter: imgsz=640
  
## Training Results
- Model: YOLOv8s
- Epochs: 50
- Image size: 640
- mAP50 (global): 0.863
- Coca-Cola mAP50: 0.852
- Adidas mAP50: 0.830
- Nike mAP50: 0.744
- Weights: stored in Google Drive (logo-detection/logo-detection-v1/weights/best.pt)