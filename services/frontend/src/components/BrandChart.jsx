import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const barColors = ['#1D9E75', '#2DBE8F', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6']

export default function BrandChart({ brands }) {
  const sortedBrands = [...brands].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))

  const chartData = sortedBrands.map((b) => ({
    name: b.brand_name,
    percentage: parseFloat((b.percentage || 0).toFixed(1)),
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="font-semibold text-white mb-1">{data.name}</p>
          <p className="text-sm text-brand-green font-medium">{data.percentage}% del vídeo</p>
        </div>
      )
    }
    return null
  }

  if (!brands?.length) {
    return (
      <div className="glass-card text-center py-12 text-slate-500">
        No hay datos suficientes para el gráfico
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Presencia de marcas
      </h3>
      <p className="text-sm text-slate-500 mb-6">Porcentaje de tiempo en pantalla por marca</p>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(29, 158, 117, 0.08)' }} />
            <Bar dataKey="percentage" radius={[0, 6, 6, 0]} maxBarSize={36}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
