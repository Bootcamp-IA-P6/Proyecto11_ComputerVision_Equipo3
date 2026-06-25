import { Link } from 'react-router-dom'
import { FileVideo, Calendar, Tag, Trash2, ArrowRight, SearchX } from 'lucide-react'

export default function VideoHistoryTable({ history, onVideoClick, onClear, totalCount }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '—'
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!history?.length) {
    const isFiltered = totalCount > 0
    return (
      <div className="glass-card text-center py-16 px-6">
        {isFiltered ? (
          <>
            <SearchX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Sin resultados
            </h3>
            <p className="text-sm text-slate-500">No hay vídeos que coincidan con tu búsqueda</p>
          </>
        ) : (
          <>
            <FileVideo className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No hay vídeos analizados
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Los vídeos que analices aparecerán aquí automáticamente
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              Analizar un vídeo
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {history.length} de {totalCount ?? history.length}{' '}
          {history.length === 1 ? 'vídeo' : 'vídeos'}
        </p>
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar historial
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Vídeo
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Marcas
                </th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {history.map((video) => (
                <tr
                  key={video.video_id}
                  onClick={() => onVideoClick(video)}
                  className="hover:bg-brand-green/5 cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition-colors">
                        <FileVideo className="w-5 h-5 text-brand-green" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white truncate max-w-xs">
                        {video.video_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      {formatDate(video.timestamp)}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-green/10 text-brand-green border border-brand-green/20">
                      <Tag className="w-3 h-3" />
                      {video.brandCount || 0}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-sm text-brand-green font-medium group-hover:gap-2 transition-all">
                      Ver informe
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
