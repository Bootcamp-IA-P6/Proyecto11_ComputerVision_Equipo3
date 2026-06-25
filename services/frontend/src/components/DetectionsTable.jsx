import { getCropImageUrl } from '../services/api'

export default function DetectionsTable({ detections }) {
  if (!detections?.length) return null

  const sorted = [...detections].sort((a, b) => a.start_time - b.start_time)

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detecciones individuales</h3>
        <p className="text-sm text-slate-400 mt-1">
          {sorted.length} apariciones registradas con timestamp y confianza
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/50">
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Marca
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Inicio
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Fin
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Duración
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confianza
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Crop
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {sorted.map((det, i) => {
              const duration = (det.end_time || 0) - (det.start_time || 0)
              const conf = (det.confidence || 0) * 100
              const confColor =
                conf >= 80
                  ? 'text-emerald-400'
                  : conf >= 60
                    ? 'text-amber-400'
                    : 'text-red-400'

              return (
                <tr
                  key={`${det.brand_name}-${det.start_time}-${i}`}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 px-5 font-medium text-slate-900 dark:text-white">{det.brand_name}</td>
                  <td className="py-3.5 px-5 text-slate-400 tabular-nums">
                    {det.start_time?.toFixed(2)}s
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 tabular-nums">
                    {det.end_time?.toFixed(2)}s
                  </td>
                  <td className="py-3.5 px-5 text-slate-300 tabular-nums">
                    {duration.toFixed(2)}s
                  </td>
                  <td className={`py-3.5 px-5 font-semibold tabular-nums ${confColor}`}>
                    {conf.toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-5">
                    {det.crop_path ? (
                      <img
                        src={getCropImageUrl(det.crop_path)}
                        alt={det.brand_name}
                        className="w-10 h-10 object-cover rounded-md border border-slate-600"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
