import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, AlertCircle, Film } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import ProgressBar from '../components/ProgressBar'
import { uploadVideo, saveToHistory } from '../services/api'

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const videoUrlRef = useRef(null)
  const [fileError, setFileError] = useState(null)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState(null)

  const revokeVideoUrl = useCallback(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current)
      videoUrlRef.current = null
    }
    setVideoUrl(null)
  }, [])

  const handleFileSelect = useCallback((selectedFile, errorMsg) => {
    if (errorMsg) {
      setFile(null)
      revokeVideoUrl()
      setFileError(errorMsg)
      setStatus('idle')
      return
    }
    revokeVideoUrl()
    const url = URL.createObjectURL(selectedFile)
    videoUrlRef.current = url
    setVideoUrl(url)
    setFile(selectedFile)
    setFileError(null)
    setStatus('ready')
    setError(null)
  }, [revokeVideoUrl])

  const handleFileRemove = useCallback(() => {
    setFile(null)
    revokeVideoUrl()
    setFileError(null)
    setStatus('idle')
    setProgress(0)
  }, [revokeVideoUrl])

  const handleAnalyze = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(10)
    setStartTime(Date.now())

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 12))
      }, 1000)

      const result = await uploadVideo(file)
      clearInterval(progressInterval)
      setProgress(100)

      const playbackFile = file

      try {
        saveToHistory({
          video_id: result.video_id,
          video_name: result.video_name || file.name,
          timestamp: Date.now(),
          brandCount: result.detections?.length || 0,
          detections: result.detections || [],
          frame_detections: result.frame_detections || [],
          duration_seconds: result.duration_seconds,
        })
      } catch {
        // localStorage puede fallar si frame_detections es muy grande; no bloquear navegación
      }

      setTimeout(() => {
        navigate('/report', {
          state: {
            videoId: result.video_id,
            videoName: result.video_name || file.name,
            detections: result.detections || [],
            frame_detections: result.frame_detections || [],
            duration_seconds: result.duration_seconds,
            videoFile: playbackFile,
          },
        })
      }, 400)
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Error al procesar el vídeo.')
      setProgress(0)
    }
  }

  const busy = status === 'uploading' || status === 'processing'

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-brand-green text-xs font-medium uppercase tracking-wider">
          <Film className="w-3.5 h-3.5" />
          Análisis de vídeo
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Detecta marcas en tu anuncio
        </h1>
        <p className="text-sm text-slate-500 max-w-lg">
          Sube un vídeo publicitario. YOLO11s analizará cada frame y generará un informe con
          tiempo en pantalla, timeline y métricas por marca.
        </p>
      </div>

      <div className="card-minimal p-6 space-y-5">
        <UploadZone
          file={file}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          error={fileError}
        />

        {status === 'ready' && file && videoUrl && !busy && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
              <video src={videoUrl} controls className="w-full max-h-48 object-contain" />
            </div>
            <button onClick={handleAnalyze} className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Analizar vídeo
            </button>
          </div>
        )}

        {status === 'ready' && file && !videoUrl && !busy && (
          <button onClick={handleAnalyze} className="btn-primary w-full flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Analizar vídeo
          </button>
        )}

        {busy && (
          <ProgressBar
            progress={progress}
            message="Procesando con YOLO11s..."
            startTime={startTime}
          />
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/5 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>{error}</p>
              <button
                onClick={() => {
                  setStatus('ready')
                  setError(null)
                }}
                className="mt-2 text-xs font-medium hover:underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ['15', 'marcas'],
          ['0.891', 'mAP@50'],
          ['JSON', 'export'],
        ].map(([val, label]) => (
          <div key={label} className="card-minimal py-4">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{val}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
