from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.connection import get_db  # Assuming this dependency provides the session
from app.db import crud

router = APIRouter(
    prefix="/videos",
    tags=["videos"]
)


@router.get("/{video_id}/report", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
def get_video_report(video_id: int, db: Session = Depends(get_db)):
    """
    API Endpoint to fetch a complete analytical report of a processed video by its ID.
    Returns the video metadata along with all nested historical brand detections.
    """
    # Query the database using the Data Engineering CRUD reading function
    video_record = crud.get_video_report_data(db, video_id=video_id)
    
    # If the video does not exist, trigger a clean 404 client error response
    if not video_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video report with ID {video_id} not found in the database system."
        )
        
    # Serialize the relational database models manually into the required JSON schema response
    return {
        "video_id": video_record.id,
        "video_name": video_record.name,
        "detections": [
            {
                "brand_name": detection.brand.name,
                "start_time": detection.start_time,
                "end_time": detection.end_time,
                "confidence": detection.confidence,
                "crop_path": detection.crop_path,
                "bounding_box": detection.bounding_box
            }
            for detection in video_record.detections
        ]
    }