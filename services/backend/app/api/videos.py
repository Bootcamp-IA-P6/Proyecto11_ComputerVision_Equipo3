from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.db.connection import SessionLocal, get_db
from app.db import crud

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("/{video_id}/report", status_code=status.HTTP_200_OK)
def get_video_report(video_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    if SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Base de datos no configurada. Usa el historial local del frontend.",
        )

    video_record = crud.get_video_report_data(db, video_id=video_id)
    if not video_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Informe del vídeo {video_id} no encontrado.",
        )

    return {
        "video_id": video_record.video_id,
        "video_name": video_record.video_name,
        "duration_seconds": video_record.duration_seconds,
        "detections": [
            {
                "brand_name": detection.brand.brand_name,
                "start_time": detection.start_time,
                "end_time": detection.end_time,
                "confidence": detection.confidence,
                "crop_path": detection.crop_path or None,
                "bounding_box": detection.bounding_box,
            }
            for detection in video_record.detections
        ],
    }
