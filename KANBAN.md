# Kanban — Detección de Marcas en Vídeo
**Proyecto:** project-ai-computer-vision-objects  
**Equipo:** Andrés · Maryori · IsaRodAm  
**Objetivo:** Nivel Experto  
**Plazo:** 2 semanas · Fecha límite: ~2 julio 2026

---

## ✅ HECHO

### [Infra] [Esencial] Estructura inicial del repositorio
- Rama: `chore/estructura-repositorio` → mergeada a develop
- Carpetas por servicio: backend, frontend, training, data, models, docs
- .gitignore, .env.example, docker-compose.yml, pyproject.toml por servicio
- uv inicializado en backend, frontend y training

### [Docs] [Esencial] Contrato de datos JSON
- Rama: `docs/contrato-datos` → mergeada a develop
- Archivo: `docs/contrato_datos.md`
- Campos: video_name, brand_name, confidence, bounding_box [xmin,ymin,xmax,ymax], timestamp, frame_width, frame_height
- Mock con 3 detecciones de ejemplo

### [Infra] [Esencial] Diseño del esquema de BD PostgreSQL
- Rama: `docs/esquema-base-datos` → mergeada a develop
- Tablas: brands (id, name) · videos (id, filename, duration, processed_at) · detections (id, video_id FK, brand_id FK, start_time, end_time, avg_confidence, bounding_box JSONB, crop_path)

### [Infra] [Esencial] Docker + SQLAlchemy — PR #24
- Rama: `9-feature-database-setup` → mergeada a develop
- connection.py, init_db.py, database_models.py (Brand, Video, Detection)
- docker-compose.yml con PostgreSQL 15-alpine y volumen persistente
- psycopg2-binary instalado con uv

### [Feature] [Esencial] Recopilar dataset de logos — PR cerrado
- Rama: `feature/dataset-logos` → mergeada a develop
- Dataset: Logo Detection Clean v3 (Roboflow)
- URL: https://universe.roboflow.com/dimitar-dimitrov-qnnci/logo-detection-clean/dataset/3
- 15 clases: Nike, Adidas, Coca-Cola, Starbucks, Puma, Apple, Chanel...
- train: 22.088 imgs · valid: 1.481 · test: 992 — verificadas 1:1

### [Feature] [Esencial] Fine-tuning YOLO11s — PR #27
- Rama: `feature/entrenamiento-yolo-v1` → pendiente merge Maryori
- Modelo: YOLO11s · Dataset: 100% v3 · GPU: RTX 4080 local
- mAP@50: 0.891 · mAP@50-95: 0.722 · Precisión: 0.806 · Recall: 0.916
- Pesos en Hugging Face: https://huggingface.co/Marco13423/logo-detection-yolo11s
- 3 perfiles: fast (YOLO11n, 15ep) · medium (YOLO11s, 20ep) · full (50ep)
- docs: modelo.md con métricas por clase y comparativa con YOLOv8 Maryori

### [Feature] [Avanzado] Persistencia detecciones — PR #25
- Rama: `13-feature-persistencia-detecciones` → mergeada a develop
- crud.py: get_or_create_brand, create_video_record, save_video_analysis_results, get_video_report_data
- file_manager.py: save_crop(), get_crop_path()
- api/videos.py: GET /videos/{video_id}/report
- test_persistencia.py: test end-to-end storage → BD → query

---

## 🔄 EN PROGRESO

### [Feature] [Esencial] Inferencia sobre imagen estática — Issue #8
- Rama: `feature/inferencia-imagen` (por crear)
- Archivos a crear:
  - `services/backend/app/inference/detector.py`
  - `services/backend/app/inference/__init__.py`
  - `services/backend/app/api/detect.py`
- Funciones:
  - `load_model(weights_path)` — carga YOLO11s desde HF o local una sola vez
  - `predict_image(image)` — devuelve lista de detecciones en formato contrato
  - `POST /detect/image` — endpoint FastAPI
- Criterio de terminado:
  - El endpoint devuelve detecciones correctas en imagen de prueba
  - El bounding box se dibuja correctamente
  - Output real pegado en el PR

---

## 📋 POR HACER — SPRINT 1 (Esencial)

### [Infra] [Esencial] Crear tablas en PostgreSQL — Issue #9
- Rama: `feature/database-setup`
- Levantar docker-compose y ejecutar init_db.py
- Verificar que las 3 tablas existen con una inserción mock
- DATABASE_URL en .env.example documentada
- **Nota:** IsaRodAm lo tiene en su PR — verificar si está mergeado

### [Docs] [Esencial] README inicial — Issue #10
- Rama: `docs/readme-inicial`
- Descripción del proyecto, diagrama de arquitectura
- Comandos exactos de instalación y arranque
- Estructura de carpetas explicada
- Estado real del proyecto (qué funciona vs qué no)

---

## 📋 BACKLOG — SPRINT 2 (Medio)

### [Feature] [Medio] Procesar vídeo frame a frame — Issue #11
- Rama: `feature/procesado-video`
- `inference/video_processor.py` con OpenCV
- `extract_frames(video_path, fps)`
- `aggregate_detections(frames_detections, gap_tolerance)` → start_time/end_time
- `POST /detect/video` — acepta .mp4, devuelve intervalos agregados
- GPU local para inferencia
- Criterio: vídeo 30s procesado en < 2 min, output pegado en PR

### [Feature] [Medio] Mostrar clase y confianza en vídeo — Issue #12
- Rama: `feature/anotacion-video`
- `inference/annotator.py` — dibuja bbox + "Nike 89%" sobre cada frame
- Vídeo anotado guardado en `storage/outputs/`
- Ruta del vídeo anotado en respuesta del endpoint

---

## 📋 BACKLOG — SPRINT 3 (Avanzado)

### [Feature] [Avanzado] Ampliar dataset a multimarca — Issue #13
- Rama: `feature/modelo-multimarca`
- Reentrenar con más marcas si hace falta
- mAP@50 > 0.65 en todas las clases
- Nuevas clases registradas en tabla brands

### [Feature] [Avanzado] Endpoint informe tiempos/porcentajes — Issue #15
- Rama: `feature/endpoint-informe`
- `calculate_report(video_id)` en db/
- Calcula total_time_seconds y percentage por marca
- `GET /videos/{id}/report` devuelve tiempo, porcentaje, confianza media
- Los porcentajes suman ≤ 100%

---

## 📋 BACKLOG — SPRINT 4 (Experto)

### [Feature] [Experto] Frontend Streamlit completo — Issue #16
- Rama: `feature/frontend-streamlit`
- Subida de vídeo con barra de progreso
- Informe con tabla por marca (tiempo, porcentaje, recortes)
- Gráfico de barras con porcentajes
- Historial de vídeos procesados

### [Infra] [Experto] Dockerizar servicios — Issue #17
- Rama: `feature/dockerizacion`
- Dockerfiles de backend y frontend con uv
- docker-compose.yml con los 3 servicios
- `docker-compose up --build` arranca todo sin errores

### [Infra] [Experto] Desplegar API en Render — Issue #18
- Rama: `feature/despliegue-render`
- Backend FastAPI + PostgreSQL en Render (tier gratuito)
- Frontend en Streamlit Community Cloud
- Flujo completo verificado en producción con vídeo real

### [Docs] [Experto] Presentación técnica final — Issue #19
- Rama: `docs/presentacion-tecnica`
- Slides: arquitectura, tecnologías, dataset, métricas, demo, estado real
- Honesta sobre qué funciona en producción vs qué está preparado sin activar

---

## 🏗️ ARQUITECTURA

```
Usuario
   │
   ▼
Frontend (Streamlit) — Streamlit Community Cloud
   │  POST /detect/video · GET /videos/{id}/report
   ▼
Backend (FastAPI) — Render
   ├── inference/detector.py    ← YOLO11s desde Hugging Face
   ├── inference/video_processor.py
   ├── db/crud.py               ← PostgreSQL via SQLAlchemy
   └── storage/file_manager.py  ← crops en disco
   │
   ▼
PostgreSQL — Render
```

---

## 🤖 MODELOS

| Modelo | Arquitectura | mAP@50 | Dataset | Hardware |
|---|---|---|---|---|
| **Principal** (Andrés) | YOLO11s | **0.891** | 20% v3 | RTX 4080 local |
| Backup (Maryori) | YOLOv8s | 0.863 | 100% v3 | T4 Colab |

**Pesos principales:** https://huggingface.co/Marco13423/logo-detection-yolo11s

Descargar:
```python
from huggingface_hub import hf_hub_download
hf_hub_download(repo_id="Marco13423/logo-detection-yolo11s", filename="best.pt", local_dir="models/")
```

---

## 📐 CONTRATO DE DATOS

```json
{
  "video_name": "anuncio.mp4",
  "brand_name": "Nike",
  "confidence": 0.89,
  "bounding_box": [100, 50, 300, 400],
  "timestamp": 12.5,
  "frame_width": 1920,
  "frame_height": 1080
}
```

---

## 🌿 RAMAS ACTIVAS

```
main
  └── develop
        ├── feature/inferencia-imagen     ← AHORA (Andrés)
        ├── feature/database-setup        ← Issue #9
        ├── docs/readme-inicial           ← Issue #10
        └── feature/procesado-video       ← próximo
```

**Reglas:**
- Nadie pushea directo a main ni develop
- Todo entra por PR con al menos 1 revisión
- Conventional Commits: `feat(inference): descripción`

---

## ✍️ PRÓXIMO COMMIT

```
feat(inference): wrapper YOLO11s para detección en imagen estática

- detector.py con load_model() y predict_image()
- endpoint POST /detect/image en api/detect.py
- modelo cargado desde Hugging Face Hub
- output verificado con imagen real de prueba
```
