-- PostgreSQL Database Schema for Computer Vision Pipeline

-- 1. Create Videos Table
CREATE TABLE IF NOT EXISTS videos (
    video_id SERIAL PRIMARY KEY,
    video_name VARCHAR(255) NOT NULL UNIQUE,
    duration_seconds FLOAT NOT NULL CHECK (duration_seconds > 0)
);

-- 2. Create Detections Table
CREATE TABLE IF NOT EXISTS detections (
    detection_id SERIAL PRIMARY KEY,
    video_id INT NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    start_time FLOAT NOT NULL CHECK (start_time >= 0),
    end_time FLOAT NOT NULL CHECK (end_time >= start_time),
    confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    bounding_box JSONB NOT NULL,
    crop_path VARCHAR(512) NOT NULL,
    CONSTRAINT fk_video FOREIGN KEY (video_id) REFERENCES videos (video_id) ON DELETE CASCADE
);