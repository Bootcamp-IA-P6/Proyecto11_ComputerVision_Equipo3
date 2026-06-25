"""
Módulo de procesado de vídeo frame a frame.
Extrae frames con OpenCV, ejecuta YOLO11s en cada uno
y agrupa detecciones consecutivas en intervalos start_time/end_time.
"""

import cv2
import numpy as np
from PIL import Image
from collections import defaultdict
from app.inference.detector import predict_image


def extract_frames(video_path: str, sample_fps: int = 2):
    """
    Extrae frames del vídeo a la frecuencia indicada.
    sample_fps=2 significa 2 frames por segundo analizados.
    Devuelve lista de (timestamp_segundos, imagen_PIL).
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"No se puede abrir el vídeo: {video_path}")

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / video_fps

    frame_interval = max(1, int(video_fps / sample_fps))

    frames = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            timestamp = frame_idx / video_fps
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(rgb)
            frames.append((timestamp, img))
        frame_idx += 1

    cap.release()

    print(f"Vídeo: {duration:.1f}s | FPS reales: {video_fps} | Frames analizados: {len(frames)}")
    return frames, duration


def aggregate_detections(frames_detections: list, gap_tolerance: float = 1.0):
    """
    Agrupa detecciones consecutivas de la misma marca en intervalos.
    gap_tolerance: segundos de hueco permitido entre detecciones para
    considerarlas el mismo intervalo (por defecto 1 segundo).

    Entrada: [(timestamp, [detecciones])]
    Salida: [{"brand_name", "start_time", "end_time", "avg_confidence", "appearances"}]
    """
    # Agrupar por marca
    brand_timestamps = defaultdict(list)
    brand_confidences = defaultdict(list)

    for timestamp, detections in frames_detections:
        for det in detections:
            brand = det["brand_name"]
            brand_timestamps[brand].append(timestamp)
            brand_confidences[brand].append(det["confidence"])

    intervals = []

    for brand, timestamps in brand_timestamps.items():
        timestamps = sorted(timestamps)
        confidences = brand_confidences[brand]

        # Agrupar timestamps consecutivos respetando gap_tolerance
        groups = []
        current_group = [timestamps[0]]
        current_confs = [confidences[0]]

        for i in range(1, len(timestamps)):
            if timestamps[i] - timestamps[i - 1] <= gap_tolerance:
                current_group.append(timestamps[i])
                current_confs.append(confidences[i])
            else:
                groups.append((current_group, current_confs))
                current_group = [timestamps[i]]
                current_confs = [confidences[i]]

        groups.append((current_group, current_confs))

        for group, confs in groups:
            intervals.append({
                "brand_name":      brand,
                "start_time":      round(group[0], 2),
                "end_time":        round(group[-1], 2),
                "duration_seconds": round(group[-1] - group[0], 2),
                "avg_confidence":  round(sum(confs) / len(confs), 4),
                "appearances":     len(group),
            })

    # Ordenar por start_time
    intervals.sort(key=lambda x: x["start_time"])
    return intervals


def process_video(video_path: str, sample_fps: int = 2, gap_tolerance: float = 1.0):
    """
    Pipeline completo: extrae frames → inferencia → agrega detecciones.
    """
    import time
    start = time.time()

    frames, duration = extract_frames(video_path, sample_fps)

    frames_detections = []
    for timestamp, img in frames:
        detections = predict_image(img)
        if detections:
            frames_detections.append((timestamp, detections))

    intervals = aggregate_detections(frames_detections, gap_tolerance)

    elapsed = time.time() - start

    return {
        "duration_seconds":  round(duration, 2),
        "frames_analyzed":   len(frames),
        "processing_time_s": round(elapsed, 2),
        "intervals":         intervals,
        "total_brands":      len(set(i["brand_name"] for i in intervals)),
    }
