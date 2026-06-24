import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, AlertCircle, Sparkles, Clock, BarChart3, Shield } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import ProgressBar from '../components/ProgressBar'
import { uploadVideo, saveToHistory } from '../services/api'

const steps = [
  { num: '01', title: 'Sube tu vídeo', desc: 'Arrastra un .mp4 publicitario' },
  { num: '02', title: 'IA analiza frames', desc: 'YOLO11s detecta logos en tiempo real' },
  { num: '03', title: 'Informe completo', desc: 'Métricas, timeline y detecciones' },
]

const features = [
  {
    icon: Shield,
    title: 'Detección precisa',
    desc: '15 marcas · mAP@50 0.891 con YOLO11s',
  },
  {
    icon: Clock,
    title: 'Tiempo en pantalla',
    desc: 'Mide cuánto dura cada aparición de marca',
  },
  {
    icon: BarChart3,
    title: 'Analytics visual',
    desc: 'Gráficos, timeline y exportación JSON',
  },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState(null)

  const handleFileSelect = useCallback((selectedFile, errorMsg) => {
    if (errorMsg) {
      setFile(null)
      setFileError(errorMsg)
      setStatus('idle')
      return
    }
    setFile(selectedFile)
    setFileError(null)
    setStatus('ready')
    setError(null)
  }, [])

  const handleFileRemove = useCallback(() => {
    setFile(null)
    setFileError(null)
    setStatus('idle')
    setProgress(0)
  }, [])

  const handleAnalyze = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(10)
    setStartTime(Date.now())

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 1000)

      const result = await uploadVideo(file)
      clearInterval(progressInterval)
      setProgress(100)

      saveToHistory({
        video_id: result.video_id,
        video_name: result.video_name || file.name,
        timestamp: Date.now(),
        brandCount: result.detections?.length || 0,
      })

      setTimeout(() => {
        navigate('/report', {
          state: {
            videoId: result.video_id,
            videoName: result.video_name || file.name,
            detections: result.detections || [],
          },
        })
      }, 500)
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Error al procesar el vídeo. Inténtalo de nuevo.')
      setProgress(0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-8 sm:p-10 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/5 to-transparent pointer-events-none" />
        <div className="relative">
          <span className="badge mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            YOLO11s · Logo Detection Clean v3
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Analiza marcas en tus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-green-light">
              vídeos publicitarios
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg">
            Sube un vídeo y descubre qué logos aparecen, cuánto tiempo están en
            pantalla y con qué nivel de confianza.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {steps.map((step) => (
          <div key={step.num} className="glass-card p-4 text-center">
            <span className="text-xs font-bold text-brand-green">{step.num}</span>
            <h3 className="font-semibold text-slate-900 dark:text-white mt-1 text-sm">
              {step.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="glass-card p-6 sm:p-8 mb-6">
        <UploadZone
          file={file}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          error={fileError}
        />

        {status === 'ready' && file && (
          <button
            onClick={handleAnalyze}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg mt-6"
          >
            <Upload className="w-5 h-5" />
            Analizar vídeo
          </button>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="mt-6">
            <ProgressBar
              progress={progress}
              message={status === 'uploading' ? 'Subiendo vídeo...' : 'Analizando frames con IA...'}
              startTime={startTime}
            />
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-400">Error en el análisis</h3>
                <p className="text-sm text-red-400/80 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setStatus('ready')
                    setError(null)
                    setProgress(0)
                  }}
                  className="mt-3 text-sm font-medium text-red-400 hover:underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass-card p-5 group hover:border-brand-green/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5 text-brand-green" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              {title}
            </h3>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
