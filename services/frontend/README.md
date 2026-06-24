# Logo Detection - Frontend

Aplicación React para el sistema de detección de logos de marcas en vídeos publicitarios.

## 🚀 Cómo ejecutar

### 1. Instalar dependencias

```bash
cd "C:\Users\torre\OneDrive\Escritorio\TAREAS F5\TRABAJOS EN EQUIPO F5\project-ai-computer-vision-objects\Proyecto11_ComputerVision_Equipo3\services\frontend"
npm install
```

### 2. Configurar la API

Copia el archivo de ejemplo y configura la URL de tu API:

```bash
cp .env.example .env
```

Edita `.env` y ajusta la URL:

```env
# Para desarrollo local con FastAPI
VITE_API_URL=http://localhost:8000

# Para producción en Render
# VITE_API_URL=https://tu-api-en-render.onrender.com
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Compilar para producción

```bash
npm run build
```

Los archivos estáticos se generarán en la carpeta `dist/`.

---

## 📁 Estructura del proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── UploadZone.jsx   # Zona de drag & drop para vídeos
│   ├── ProgressBar.jsx  # Barra de progreso con mensaje de espera
│   ├── BrandCard.jsx    # Tarjeta de información por marca
│   ├── BrandChart.jsx   # Gráfico de barras con Recharts
│   └── VideoHistoryTable.jsx  # Tabla de historial
├── pages/               # Páginas principales
│   ├── UploadPage.jsx   # Página de subida
│   ├── ReportPage.jsx   # Página de informe
│   └── HistoryPage.jsx  # Página de historial
├── services/            # Llamadas a la API
│   └── api.js          # Todas las llamadas a FastAPI
├── App.jsx             # Componente raíz con rutas
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales + Tailwind
```

---

## 🔌 API Endpoints

La aplicación consume los siguientes endpoints:

### POST /detect/video
Sube un archivo .mp4 para análisis.

**Request:** `multipart/form-data` con campo `file`

**Response:**
```json
{
  "video_id": 1,
  "video_name": "anuncio.mp4",
  "detections": [
    {
      "brand_name": "Nike",
      "start_time": 2.5,
      "end_time": 8.3,
      "confidence": 0.89,
      "crop_path": "storage/crops/nike_2.50.jpg",
      "bounding_box": [100, 50, 300, 400]
    }
  ]
}
```

### GET /videos/{id}/report
Obtiene el informe completo de un vídeo.

**Response:** Mismo formato que arriba.

---

## 🎨 Características

- **Drag & Drop**: Arrastra vídeos directamente a la zona de subida
- **Validación**: Solo acepta archivos .mp4 (máx. 500MB)
- **Progreso en tiempo real**: Barra de progreso durante el análisis
- **Mensaje de espera**: Si el análisis supera los 30s, muestra aviso
- **Gráficos interactivos**: Barras horizontales con Recharts
- **Historial local**: Guarda vídeos analizados en localStorage
- **Responsive**: Funciona en móvil y escritorio
- **Modo oscuro**: Soporte para `dark:` con Tailwind

---

## 🛠 Tecnologías

- React 18 + Hooks
- React Router 6
- Tailwind CSS
- Recharts (gráficos)
- Lucide React (iconos)
- Vite (build tool)

---

## ⚙️ Configuración

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API FastAPI | `http://localhost:8000` |

---

## 📝 Notas

- El historial se almacena en `localStorage` (máx. 50 vídeos)
- Las imágenes de crops se cargan desde la API directamente
- Si la API está en Render, asegúrate de configurar CORS correctamente
