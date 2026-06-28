import { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

const COLORS = ['#1D9E75', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6', '#fb7185']

const brandColorMap = new Map()

function colorForBrand(brand) {
  if (!brandColorMap.has(brand)) {
    brandColorMap.set(brand, COLORS[brandColorMap.size % COLORS.length])
  }
  return brandColorMap.get(brand)
}

function getDetectionsAtTime(frameDetections, time, tolerance = 0.55) {
  if (!frameDetections?.length) return []
  let best = null
  let bestDiff = Infinity
  for (const frame of frameDetections) {
    const diff = Math.abs(frame.timestamp - time)
    if (diff < bestDiff) {
      bestDiff = diff
      best = frame
    }
  }
  if (!best || bestDiff > tolerance) return []
  return best.detections || []
}

function getActiveBrands(intervals, time) {
  if (!intervals?.length) return []
  return intervals
    .filter((d) => time >= d.start_time && time <= d.end_time + 0.3)
    .map((d) => d.brand_name)
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayerWithDetections({ videoUrl, frameDetections = [], intervals = [] }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeBrands, setActiveBrands] = useState([])
  const [liveDetections, setLiveDetections] = useState([])
  const [videoError, setVideoError] = useState(false)

  const syncCanvasSize = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }, [])

  const drawOverlay = useCallback(
    (time) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const ctx = canvas.getContext('2d')
      const detections = getDetectionsAtTime(frameDetections, time)
      setLiveDetections(detections)
      setActiveBrands(getActiveBrands(intervals, time))

      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) return

      const scaleX = canvas.width / vw
      const scaleY = canvas.height / vh

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bounding_box || []
        if (x2 == null) return

        const color = colorForBrand(det.brand_name)
        const sx = x1 * scaleX
        const sy = y1 * scaleY
        const sw = (x2 - x1) * scaleX
        const sh = (y2 - y1) * scaleY
        const lineW = Math.max(2, canvas.width / 400)

        ctx.strokeStyle = color
        ctx.lineWidth = lineW
        ctx.strokeRect(sx, sy, sw, sh)

        const label = `${det.brand_name} ${(det.confidence * 100).toFixed(0)}%`
        const fontSize = Math.max(11, canvas.width / 55)
        ctx.font = `bold ${fontSize}px Inter, sans-serif`
        const tw = ctx.measureText(label).width
        const labelH = fontSize + 8

        ctx.fillStyle = color
        ctx.fillRect(sx, Math.max(0, sy - labelH), tw + 10, labelH)
        ctx.fillStyle = '#fff'
        ctx.fillText(label, sx + 5, Math.max(fontSize + 2, sy - 5))
      })
    },
    [frameDetections, intervals]
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    setVideoError(false)

    const onLoaded = () => {
      setDuration(video.duration || 0)
      syncCanvasSize()
      drawOverlay(video.currentTime || 0)
    }
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      drawOverlay(video.currentTime)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)
    const onError = () => setVideoError(true)

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)

    if (video.readyState >= 1) onLoaded()

    const ro = new ResizeObserver(() => {
      syncCanvasSize()
      drawOverlay(video.currentTime || 0)
    })
    if (containerRef.current) ro.observe(containerRef.current)

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
      ro.disconnect()
    }
  }, [videoUrl, syncCanvasSize, drawOverlay])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    video.currentTime = ratio * duration
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="card-minimal overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Reproducción con detección</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Las cajas se sincronizan con el análisis frame a frame. Pausa cuando quieras.
          </p>
        </div>
        {liveDetections.length > 0 && (
          <span className="text-xs font-medium text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full shrink-0">
            {liveDetections.length} logo{liveDetections.length !== 1 ? 's' : ''} en pantalla
          </span>
        )}
      </div>

      <div ref={containerRef} className="relative bg-black flex justify-center p-0 min-h-[200px]">
        {videoError ? (
          <p className="text-sm text-slate-400 p-8 text-center">
            No se pudo cargar el vídeo. Vuelve a subirlo desde el inicio.
          </p>
        ) : (
          <div className="relative inline-block max-w-full">
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              className="block max-h-[480px] w-auto max-w-full"
              playsInline
              preload="auto"
              muted={muted}
              onClick={togglePlay}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>
        )}
        {!playing && !videoError && videoUrl && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            aria-label="Reproducir"
          >
            <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-slate-900 ml-1" />
            </span>
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        <div
          role="slider"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-brand-green rounded-full relative group-hover:bg-brand-green/80 transition-colors"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={togglePlay} className="btn-ghost p-2" aria-label={playing ? 'Pausar' : 'Reproducir'}>
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button type="button" onClick={toggleMute} className="btn-ghost p-2" aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-xs text-slate-500 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {activeBrands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeBrands.map((brand) => (
              <span
                key={brand}
                className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: colorForBrand(brand) }}
              >
                {brand}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
