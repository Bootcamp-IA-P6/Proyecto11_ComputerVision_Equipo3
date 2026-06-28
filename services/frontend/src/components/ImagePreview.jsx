import { useRef, useEffect } from 'react'

const COLORS = ['#1D9E75', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6', '#fb7185']

export default function ImagePreview({ imageUrl, detections }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !imageUrl) return

    const draw = () => {
      const ctx = canvas.getContext('2d')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)

      detections.forEach((det, i) => {
        const [x1, y1, x2, y2] = det.bounding_box || []
        if (!x2) return
        const color = COLORS[i % COLORS.length]
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(2, img.naturalWidth / 400)
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
        ctx.fillStyle = color
        ctx.font = `bold ${Math.max(12, img.naturalWidth / 50)}px Inter, sans-serif`
        const label = `${det.brand_name} ${(det.confidence * 100).toFixed(0)}%`
        const tw = ctx.measureText(label).width
        ctx.fillRect(x1, Math.max(0, y1 - 22), tw + 8, 22)
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x1 + 4, Math.max(16, y1 - 6))
      })
    }

    if (img.complete) draw()
    else img.onload = draw
  }, [imageUrl, detections])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <img ref={imgRef} src={imageUrl} alt="Análisis" className="hidden" crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="w-full h-auto max-h-[520px] object-contain" />
    </div>
  )
}
