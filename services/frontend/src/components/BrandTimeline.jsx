export default function BrandTimeline({ detections, totalDuration }) {
  if (!detections?.length || !totalDuration) {
    return (
      <div className="glass-card p-6 text-center text-slate-500 text-sm">
        No hay datos de timeline disponibles
      </div>
    )
  }

  const colors = [
    '#1D9E75',
    '#2DBE8F',
    '#38bdf8',
    '#a78bfa',
    '#fbbf24',
    '#f472b6',
  ]

  const brandColors = {}
  let colorIdx = 0
  detections.forEach((d) => {
    if (!brandColors[d.brand_name]) {
      brandColors[d.brand_name] = colors[colorIdx % colors.length]
      colorIdx++
    }
  })

  const sorted = [...detections].sort((a, b) => a.start_time - b.start_time)

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Timeline de apariciones</h3>
      <p className="text-sm text-slate-400 mb-6">
        Cuándo aparece cada marca a lo largo del vídeo
      </p>

      <div className="relative h-12 bg-slate-200 dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700/50 mb-4">
        {sorted.map((det, i) => {
          const left = (det.start_time / totalDuration) * 100
          const width = Math.max(
            ((det.end_time - det.start_time) / totalDuration) * 100,
            0.5
          )
          return (
            <div
              key={`${det.brand_name}-${det.start_time}-${i}`}
              className="absolute top-1 bottom-1 rounded-md opacity-90 hover:opacity-100 transition-opacity cursor-default"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: brandColors[det.brand_name],
              }}
              title={`${det.brand_name}: ${det.start_time.toFixed(1)}s – ${det.end_time.toFixed(1)}s`}
            />
          )
        })}
      </div>

      <div className="flex justify-between text-xs text-slate-500 mb-6 px-1">
        <span>0s</span>
        <span>{(totalDuration / 2).toFixed(0)}s</span>
        <span>{totalDuration.toFixed(1)}s</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(brandColors).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}
