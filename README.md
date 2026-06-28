# Sistema de Detección de Logos en Vídeos Publicitarios

> Proyecto de Computer Vision — Bootcamp IA & Data Engineering · Factoría F5 Madrid · 2026

Sistema de inteligencia artificial que analiza vídeos publicitarios para detectar cuánto tiempo aparece cada logo de marca en pantalla, generando informes con tiempo total y porcentaje de aparición por marca.

---

## Arquitectura

```
Usuario
   │
   ▼
Frontend (React + Tailwind CSS + Recharts)
   │  POST /detect/video · GET /videos/{id}/report
   ▼
Backend (FastAPI)
   ├── inference/detector.py    ← YOLO11s desde Hugging Face
   ├── db/crud.py               ← PostgreSQL via SQLAlchemy
   └── storage/file_manager.py  ← crops en disco
   │
   ▼
PostgreSQL
```

---

## Modelo

| Campo | Detalle |
|---|---|
| Arquitectura | YOLO11s — 9.4M parámetros |
| Dataset | Logo Detection Clean v3 (Roboflow) — 22.088 imágenes |
| Marcas detectadas | 15 (Nike, Adidas, Coca-Cola, Starbucks, Puma...) |
| **mAP@50** | **0.891** |
| mAP@50-95 | 0.722 |
| Precisión | 0.806 |
| Recall | 0.916 |
| Pesos | [Marco13423/logo-detection-yolo11s](https://huggingface.co/Marco13423/logo-detection-yolo11s) |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Modelo IA | YOLO11s (Ultralytics) |
| Backend | FastAPI + SQLAlchemy |
| Base de datos | PostgreSQL |
| Frontend | React + Tailwind CSS + Recharts + Vite |
| Gestión dependencias | uv (backend) · npm (frontend) |
| Contenedores | Docker + docker-compose |
| Modelo hosting | Hugging Face Hub |
| Hosting API | Render |
| Hosting Frontend | Vercel |

---

## Estructura del proyecto

```
Proyecto11_ComputerVision_Equipo3/
├── docker-compose.yml          ← levanta PostgreSQL con un comando
├── .env.example                ← variables de entorno documentadas
├── KANBAN.md                   ← tablero de tareas del proyecto
├── data/
│   ├── raw/                    ← imágenes sin procesar (excluido de git)
│   └── processed/              ← dataset anotado en formato YOLO (excluido de git)
├── training/
│   ├── download_dataset.py     ← descarga Logo Detection Clean v3 desde Roboflow
│   ├── verify_dataset.py       ← verifica integridad del dataset
│   ├── train.py                ← entrenamiento YOLO11s (perfiles: fast/medium/full)
│   └── upload_model.py         ← sube los pesos a Hugging Face
├── models/                     ← pesos best.pt (excluido de git, se descarga de HF)
│   └── modelo.md               ← documentación y métricas del modelo
├── services/
│   ├── backend/                ← API FastAPI
│   │   └── app/
│   │       ├── main.py         ← punto de entrada de la API
│   │       ├── inference/      ← wrapper YOLO11s: load_model, predict_image
│   │       ├── api/            ← endpoints: /detect/image, /videos/{id}/report
│   │       ├── db/             ← conexión PostgreSQL, crud, init_db
│   │       ├── models/         ← tablas SQLAlchemy: Brand, Video, Detection
│   │       └── storage/        ← file_manager: guarda y lee crops
│   └── frontend/               ← interfaz React
│       ├── src/
│       │   ├── components/     ← UploadZone, BrandCard, BrandChart...
│       │   ├── pages/          ← UploadPage, ReportPage, HistoryPage
│       │   └── services/api.js ← todas las llamadas a la API
│       └── package.json
└── docs/
    ├── contrato_datos.md       ← formato JSON acordado entre modelo y API
    ├── esquema_bd.md           ← diseño de las tablas PostgreSQL
    └── modelo.md               ← métricas del modelo entrenado
```

---

## Instalación y arranque en local

### Requisitos previos
- Python 3.10+
- [uv](https://docs.astral.sh/uv/) instalado
- Docker Desktop
- Node.js 18+

### 1. Clonar el repositorio
```bash
git clone https://github.com/Bootcamp-IA-P6/Proyecto11_ComputerVision_Equipo3.git
cd Proyecto11_ComputerVision_Equipo3
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus valores reales
```

Variables necesarias en `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/computer_vision_db
HF_TOKEN=tu_token_de_huggingface
ROBOFLOW_API_KEY=tu_api_key_de_roboflow
```

### 3. Levantar PostgreSQL
```bash
docker-compose up -d postgres_db
```

### 4. Arrancar el backend
```bash
cd services/backend
uv sync
uv run python app/db/init_db.py   # crea las tablas
uv run uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (documentación automática)
```

El modelo se descarga automáticamente desde Hugging Face en el primer arranque.

### 5. Arrancar el frontend
```bash
cd services/frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Estado de la API |
| GET | `/health` | Health check |
| POST | `/detect/image` | Detecta logos en una imagen |
| POST | `/detect/video` | Procesa un vídeo completo frame a frame |
| GET | `/videos/{id}/report` | Informe completo de un vídeo procesado |

### Ejemplo de uso
```bash
# Detectar logos en una imagen
curl -X POST http://localhost:8000/detect/image \
  -F "file=@imagen_con_logo.jpg"

# Respuesta
{
  "filename": "imagen_con_logo.jpg",
  "total": 1,
  "detections": [
    {
      "brand_name": "Nike",
      "confidence": 0.891,
      "bounding_box": [100, 50, 300, 400],
      "frame_width": 1920,
      "frame_height": 1080
    }
  ]
}
```

---

## 🗄️ Esquema de base de datos

```
brands              videos                    detections
──────────          ──────────────────────    ──────────────────────────
brand_id (PK)       video_id (PK)             detection_id (PK)
brand_name          video_name                video_id  (FK → videos)
                    duration_seconds          brand_id  (FK → brands)
                    processed_at              start_time
                                              end_time
                                              confidence
                                              bounding_box (JSONB)
                                              crop_path
```

---

## Entrenar el modelo

```bash
cd training
uv sync

# Descargar dataset (Logo Detection Clean v3)
uv run python download_dataset.py

# Verificar integridad del dataset
uv run python verify_dataset.py

# Entrenar — perfil rápido (15 épocas, 30% dataset)
uv run python train.py --profile fast

# Entrenar — perfil medio (20 épocas, 100% dataset) — por defecto
uv run python train.py

# Entrenar — perfil completo (50 épocas)
uv run python train.py --profile full

# Subir pesos a Hugging Face
uv run python upload_model.py
```

---

## Métricas del modelo por clase

| Marca | mAP@50 | Precisión | Recall |
|---|---|---|---|
| Under Armour | 0.978 | 0.935 | 0.944 |
| Apple Inc | 0.960 | 0.945 | 0.973 |
| Starbucks | 0.959 | 0.868 | 0.991 |
| The North Face | 0.944 | 0.930 | 1.000 |
| Hard Rock Cafe | 0.937 | 0.753 | 0.988 |
| Mercedes-Benz | 0.941 | 0.880 | 0.978 |
| NFL | 0.924 | 0.853 | 0.948 |
| Toyota | 0.890 | 0.841 | 0.862 |
| Puma | 0.881 | 0.766 | 0.887 |
| Adidas | 0.868 | 0.631 | 0.947 |
| Coca-Cola | 0.865 | 0.823 | 0.872 |
| Chanel | 0.834 | 0.768 | 0.797 |
| Pepsi | 0.818 | 0.737 | 0.727 |
| Emirates | 0.794 | 0.632 | 0.921 |
| Nike | 0.765 | 0.721 | 0.904 |

---

## Equipo

| Miembro | Rol principal |
|---|---|
| Andres | Dataset, entrenamiento YOLO11s, frontend React, pipeline HF |
| Maryori | Modelo YOLOv8s (referencia), EDA, inferencia detector.py |
| IsaRodAm | Backend FastAPI, base de datos, persistencia, contrato de datos |

---

## Estado real del proyecto

### Implementado y verificado
- Estructura de repositorio y entornos uv independientes
- PostgreSQL dockerizado con tablas brands, videos, detections
- Pipeline de entrenamiento YOLO11s con 3 perfiles
- Modelo YOLO11s en Hugging Face (mAP@50: 0.891)
- Endpoint POST /detect/image funcionando
- Persistencia de detecciones en BD (crud.py + file_manager.py)
- Frontend React con drag & drop, informe y gráficos

### En progreso
- Endpoint POST /detect/video (procesado frame a frame)
- Cálculo de tiempos y porcentajes por marca

### Pendiente
- Despliegue en Render + Vercel
- Flujo completo verificado en producción

---

## Licencia académica

Este proyecto se desarrolla con fines exclusivamente académicos en el marco del Bootcamp de IA y Data Engineering de Factoría F5. Los logos, marcas registradas e imágenes utilizadas pertenecen a sus respectivos propietarios.

---

## 🔗 Referencias

- [Dataset: Logo Detection Clean v3](https://universe.roboflow.com/dimitar-dimitrov-qnnci/logo-detection-clean/dataset/3)
- [Modelo en Hugging Face](https://huggingface.co/Marco13423/logo-detection-yolo11s)
- [Ultralytics YOLO11](https://docs.ultralytics.com)
- [Briefing original](https://github.com/Factoria-F5-madrid/project-ai-computer-vision-objects)