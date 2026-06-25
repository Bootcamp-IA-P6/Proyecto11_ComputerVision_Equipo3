import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Search } from 'lucide-react'
import VideoHistoryTable from '../components/VideoHistoryTable'
import { getHistory, clearHistory } from '../services/api'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState(() => getHistory())
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return history
    const q = search.toLowerCase()
    return history.filter((v) => v.video_name?.toLowerCase().includes(q))
  }, [history, search])

  const handleVideoClick = useCallback(
    (video) => {
      navigate('/report', {
        state: {
          videoId: video.video_id,
          videoName: video.video_name,
          detections: video.detections || [],
          duration_seconds: video.duration_seconds,
        },
      })
    },
    [navigate]
  )

  const handleClearHistory = useCallback(() => {
    if (window.confirm('¿Eliminar todo el historial de análisis?')) {
      clearHistory()
      setHistory([])
    }
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-brand-green/10">
              <History className="w-5 h-5 text-brand-green" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Historial de análisis
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Vídeos analizados en esta sesión. Haz clic para ver el informe completo.
          </p>
        </div>

        {history.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar vídeo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-64 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/30"
            />
          </div>
        )}
      </div>

      <VideoHistoryTable
        history={filtered}
        onVideoClick={handleVideoClick}
        onClear={handleClearHistory}
        totalCount={history.length}
      />
    </div>
  )
}
