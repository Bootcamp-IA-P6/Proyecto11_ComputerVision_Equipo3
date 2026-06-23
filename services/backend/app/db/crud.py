from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.database_models import Video, Brand, Detection


def get_or_create_brand(db: Session, brand_name_input: str) -> Brand:
    """
    Checks if a brand already exists in the database by its name.
    If it exists, returns the record; otherwise, creates and commits a new brand.

    Parameters:
    - db: The active SQLAlchemy database session.
    - brand_name_input: The string identifier of the detected brand.

    Returns:
    - The Brand database model instance.
    """
    normalized_name = brand_name_input.strip().lower()
    
    # Query checking using the correct model column: Brand.brand_name
    existing_brand = db.query(Brand).filter(Brand.brand_name == normalized_name).first()
    
    if existing_brand:
        return existing_brand
        
    # Create a new record matching model properties
    new_brand = Brand(brand_name=normalized_name)
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return new_brand


def create_video_record(db: Session, video_name: str) -> Video:
    """
    Inserts a new video entry into the database to establish reference integrity.

    Parameters:
    - db: The active SQLAlchemy database session.
    - video_name: The filename or title of the video being processed.

    Returns:
    - The created Video database model instance containing the generated ID.
    """
    # Added duration_seconds default placeholder value to avoid nullable constraints issues
    new_video = Video(video_name=video_name, duration_seconds=0.0)
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return new_video


def save_video_analysis_results(db: Session, video_id: int, detections_list: List[Dict[str, Any]]) -> None:
    """
    Iterates through the structured analysis payload, ensures brand catalog integrity,
    and bulk stores the finalized high-confidence detections into the relational schema.

    Parameters:
    - db: The active SQLAlchemy database session.
    - video_id: The foreign key integer referencing the analyzed video.
    - detections_list: A list of dictionaries containing individual detection metadata.
    """
    for item in detections_list:
        # Resolve the unique brand database relationship entry
        brand_record = get_or_create_brand(db, item["brand_name"])
        
        # Instantiate the database detection record mapped to the correct models
        detection_record = Detection(
            video_id=video_id,
            brand_id=brand_record.brand_id,  # Using correct brand_id parameter
            start_time=item["start_time"],
            end_time=item["end_time"],
            confidence=item["confidence"],
            crop_path=item["crop_path"],
            bounding_box=item["bounding_box"]
        )
        db.add(detection_record)
        
    # Commit all buffered records safely to the database storage engine
    db.commit()


def get_video_report_data(db: Session, video_id: int) -> Video:
    """
    Retrieves a comprehensive analysis report for a specific video by its ID.
    Utilizes SQLAlchemy ORM relationships to efficiently load associated 
    detections and brand data in a single transactional query context.

    Parameters:
    - db: The active SQLAlchemy database session.
    - video_id: The primary key integer of the requested video.

    Returns:
    - The Video model instance containing nested relationship data, 
      or None if the video record does not exist.
    """
    return db.query(Video).filter(Video.video_id == video_id).first()