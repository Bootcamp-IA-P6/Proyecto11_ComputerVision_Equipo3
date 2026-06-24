import { useState, useEffect } from 'react'
import { Loader2, Zap } from 'lucide-react'

export default function ProgressBar({ progress, message, startTime }) {
  const [showLongWait, setShowLongWait] = useState(false)

  useEffect(() => {
    if (!startTime) return
    const interval = setInterval(() => {
      if (Date.now() - startTime > 30000) setShowLongWait(true)
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div className="w-full space-y-4 p-5 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {message || 'Procesando vídeo...'}
        </p>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-brand-green" />
          YOLO11s analizando frames...
        </span>
        <span className="font-semibold text-brand-green tabular-nums">{Math.round(progress)}%</span>
      </div>

      {showLongWait && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-400">
            El análisis puede tardar varios minutos según la duración del vídeo. No cierres esta
            página.
          </p>
        </div>
      )}
    </div>
  )
}
