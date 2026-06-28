import { Eye, Clock, Percent, Target } from 'lucide-react'
import { getCropImageUrl } from '../services/api'

export default function BrandCard({ brand }) {
  const {
    brand_name,
    total_time,
    percentage,
    avg_confidence,
    crop_path,
    detections_count,
  } = brand

  const conf = (avg_confidence || 0) * 100
  const confColor =
    conf >= 80 ? 'text-emerald-400' : conf >= 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="glass-card p-5 hover:border-brand-green/30 transition-all duration-300 group">
      <div className="flex gap-4">
        {crop_path && (
          <div className="flex-shrink-0">
            <img
              src={getCropImageUrl(crop_path)}
              alt={`${brand_name} logo`}
              className="w-20 h-20 object-cover rounded-xl border border-slate-700/50 group-hover:border-brand-green/30 transition-colors"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            {brand_name}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Tiempo</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {total_time?.toFixed(1) || '0.0'}s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Del vídeo</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {percentage?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Confianza</p>
                <p className={`text-sm font-semibold tabular-nums ${confColor}`}>
                  {conf.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Apariciones</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {detections_count || 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">Presencia en el vídeo</span>
          <span className="font-semibold text-brand-green tabular-nums">
            {percentage?.toFixed(1) || '0.0'}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-green to-brand-green-light rounded-full transition-all duration-700"
            style={{ width: `${Math.min(percentage || 0, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
