import sys
import os

# Ensure the app directory is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.connection import engine, Base
from app.models.database_models import Brand, Video, Detection

def init_database():
    print("Connecting to PostgreSQL and creating tables...")
    try:
        # This command reads all models inheriting from Base and creates them in Docker
        Base.metadata.create_all(bind=engine)
        print("Success: All database tables (brands, videos, detections) created successfully!")
    except Exception as e:
        print(f"Error creating database tables: {e}")

if __name__ == "__main__":
    init_database()