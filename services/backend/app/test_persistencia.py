import numpy as np
from sqlalchemy.orm import Session
from app.db.connection import SessionLocal
from app.storage.file_manager import save_crop
from app.db import crud


def run_persistence_test():
    """
    Executes an isolated end-to-end integration test for the Data Engineering pipeline.
    Simulates a video frame processing event, stores a cropped image to disk, 
    and commits relational records into the local database schema.
    """
    print("Initializing isolated data engineering integration test...")

    # 1. Create a dummy video frame (black image matrix 480x640 with 3 color channels)
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Define a simulated bounding box coordinates [xmin, ymin, xmax, ymax]
    mock_bbox = [50, 50, 200, 200]
    mock_brand = "Nike"
    mock_timestamp = 12.45

    print("Step 1: Testing file storage subsystem...")
    saved_crop_path = save_crop(
        frame=dummy_frame,
        bounding_box=mock_bbox,
        brand_name=mock_brand,
        timestamp=mock_timestamp
    )
    print(f"-> Success: Crop image stored safely at: {saved_crop_path}")

    print("\nStep 2: Testing relational database persistence subsystem...")
    db: Session = SessionLocal()
    
    try:
        # Create a new video master record entry
        video_record = crud.create_video_record(db, video_name="test_commercial_run.mp4")
        print(f"-> Success: Master video row created with generated ID: {video_record.video_id}")

        # Structure a payload mimicking the finalized contract analysis data format
        mock_analysis_payload = [
            {
                "brand_name": mock_brand,
                "start_time": 10.0,
                "end_time": 15.0,
                "confidence": 0.96,
                "crop_path": saved_crop_path,
                "bounding_box": mock_bbox
            }
        ]

        # Execute the bulk analysis results persistence storage routine
        crud.save_video_analysis_results(
            db=db,
            video_id=video_record.video_id,
            detections_list=mock_analysis_payload
        )
        print("-> Success: Analysis payload records committed successfully to relational tables.")

        print("\nStep 3: Testing database query and reporting subsystem...")
        report_data = crud.get_video_report_data(db, video_id=video_record.video_id)
        
        if report_data:
            print(f"-> Success: Report retrieved for video: '{report_data.video_name}'")
            print(f"   Total detections found linked to this record: {len(report_data.detections)}")
            for det in report_data.detections:
                print(f"   - Brand: {det.brand.brand_name} | Conf: {det.confidence} | Path: {det.crop_path}")
        else:
            print("-> Error: Failed to retrieve the video report data structure.")

    except Exception as e:
        print(f"-> Test failed due to database runtime exception: {str(e)}")
        db.rollback()
    finally:
        db.close()
        print("\nDatabase session context closed. Test lifecycle complete.")


if __name__ == "__main__":
    run_persistence_test()