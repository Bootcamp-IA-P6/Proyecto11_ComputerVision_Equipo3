import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  FileVideo,
  AlertCircle,
  Loader2,
  Download,
  Tag,
  Target,
  Layers,
} from 'lucide-react'
import BrandCard from '../components/BrandCard'
import BrandChart from '../components/BrandChart'
import BrandTimeline from '../components/BrandTimeline'
import DetectionsTable from '../components/DetectionsTable'
import KpiCard from '../components/KpiCard'
import VideoPlayerWithDetections from '../components/VideoPlayerWithDetections'
import { getVideoReport, getHistoryItem } from '../services/api'
import { buildReport } from '../utils/report'

export default function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { videoId, videoName, detections: initialDetections, videoFile, frame_detections: initialFrameDetections } =
    location.state || {}

  const [report, setReport] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [frameDetections, setFrameDetections] = useState(initialFrameDetections || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exported, setExported] = useState(false)

  useEffect(() => {
    if (!videoId) {
      navigate('/')
      return
    }

    if (initialDetections?.length > 0) {
      setReport(buildReport(videoId, videoName, initialDetections))
      if (initialFrameDetections?.length) setFrameDetections(initialFrameDetections)
      setLoading(false)
      return
    }

    const cached = getHistoryItem(videoId)
    if (cached?.detections?.length > 0) {
      setReport(
        buildReport(videoId, cached.video_name || videoName, cached.detections, cached.duration_seconds)
      )
      if (cached.frame_detections?.length) setFrameDetections(cached.frame_detections)
      setLoading(false)
      return
    }

    const fetchReport = async () => {
      try {
        const data = await getVideoReport(videoId)
        setReport(
          buildReport(data.video_id, data.video_name, data.detections, data.duration_seconds)
        )
      } catch (err) {
        setError(err.message || 'Error al cargar el informe')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [videoId, videoName, initialDetections, initialFrameDetections, navigate])

  useEffect(() => {
    if (!(videoFile instanceof File)) return undefined

    const url = URL.createObjectURL(videoFile)
    setVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [videoFile])

  const handleExport = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-${report.video_name?.replace(/\.[^.]+$/, '') || videoId}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin mb-4" />
        <p className="text-slate-500">Generando informe...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto glass-card p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Error al cargar el informe
            </h3>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary mt-4">
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!report?.brands?.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <FileVideo className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          No se detectaron marcas
        </h2>
        <p className="text-slate-500 mb-6">
          No se encontraron logos en este vídeo. Prueba con otro archivo.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Analizar otro vídeo
        </button>
      </div>
    )
  }

  const totalDetections = report.brands.reduce((a, b) => a + (b.detections_count || 0), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="btn-ghost inline-flex items-center gap-2 mb-3 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Informe de análisis
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileVideo className="w-4 h-4 text-brand-green" />
              {report.video_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-green" />
              {report.total_duration?.toFixed(1)}s
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            {exported ? '¡Descargado!' : 'Exportar JSON'}
          </button>
          <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Nuevo análisis
          </button>
        </div>
      </div>

      {videoUrl ? (
        <VideoPlayerWithDetections
          videoUrl={videoUrl}
          frameDetections={frameDetections}
          intervals={report.detections}
        />
      ) : videoFile instanceof File ? (
        <div className="card-minimal flex items-center justify-center gap-3 py-12 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
          Preparando reproducción del vídeo...
        </div>
      ) : frameDetections.length > 0 ? (
        <p className="text-sm text-slate-500 card-minimal px-4 py-3">
          El vídeo no está disponible en esta sesión (historial). Vuelve a subirlo para ver la reproducción con detecciones en vivo.
        </p>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Tag}
          label="Marcas"
          value={report.brands.length}
          sub="detectadas en el vídeo"
          accent="green"
        />
        <KpiCard
          icon={Clock}
          label="Duración"
          value={`${report.total_duration?.toFixed(1)}s`}
          sub="tiempo total del vídeo"
          accent="blue"
        />
        <KpiCard
          icon={Layers}
          label="Detecciones"
          value={totalDetections}
          sub="apariciones registradas"
          accent="amber"
        />
        <KpiCard
          icon={Target}
          label="Confianza media"
          value={`${((report.avg_confidence || 0) * 100).toFixed(0)}%`}
          sub="precisión del modelo"
          accent="green"
        />
      </div>

      {/* Chart + Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BrandChart brands={report.brands} />
        <BrandTimeline detections={report.detections} totalDuration={report.total_duration} />
      </div>

      {/* Brand cards */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Detalle por marca
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.brands
            .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
            .map((brand) => (
              <BrandCard
                key={brand.brand_name}
                brand={brand}
                totalDuration={report.total_duration}
              />
            ))}
        </div>
      </div>

      {/* Detections table */}
      <DetectionsTable detections={report.detections} />
    </div>
  )
}
