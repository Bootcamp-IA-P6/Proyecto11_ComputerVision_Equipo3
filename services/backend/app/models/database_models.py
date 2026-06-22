from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.connection import Base

class Brand(Base):
    __tablename__ = "brands"

    brand_id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(100), nullable=False, unique=True)

    # Relationship with detections
    detections = relationship("Detection", back_populates="brand", cascade="all, delete-orphan")


class Video(Base):
    __tablename__ = "videos"

    video_id = Column(Integer, primary_key=True, index=True)
    video_name = Column(String(255), nullable=False, unique=True)
    duration_seconds = Column(Float, nullable=False)

    # Relationship with detections
    detections = relationship("Detection", back_populates="video", cascade="all, delete-orphan")


class Detection(Base):
    __tablename__ = "detections"

    detection_id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.video_id", ondelete="CASCADE"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.brand_id", ondelete="CASCADE"), nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    bounding_box = Column(JSONB, nullable=False)  # Storing [xmin, ymin, xmax, ymax] as JSONB
    crop_path = Column(String(512), nullable=False)

    # Relationships
    video = relationship("Video", back_populates="detections")
    brand = relationship("Brand", back_populates="detections")