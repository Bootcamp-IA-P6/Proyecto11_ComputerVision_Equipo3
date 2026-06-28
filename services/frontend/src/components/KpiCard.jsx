export default function KpiCard({ icon: Icon, label, value, sub, accent = 'green' }) {
  const accents = {
    green: 'from-brand-green/20 to-brand-green/5 border-brand-green/20 text-brand-green',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
  }

  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:border-brand-green/30 transition-all duration-300">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accents[accent]} opacity-40 group-hover:opacity-60 transition-opacity`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
          {Icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-br ${accents[accent]}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
          {value}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
