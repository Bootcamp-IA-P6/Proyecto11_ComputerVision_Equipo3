import { useState, useEffect } from 'react'
import { checkApiHealth, API_URL } from '../services/api'

export default function ApiStatus() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true
    checkApiHealth()
      .then(() => active && setStatus('online'))
      .catch(() => active && setStatus('offline'))
    return () => {
      active = false
    }
  }, [])

  const config = {
    checking: { dot: 'bg-amber-400 animate-pulse', label: 'Conectando...', text: 'text-slate-500' },
    online: { dot: 'bg-emerald-400', label: 'API conectada', text: 'text-emerald-500' },
    offline: { dot: 'bg-red-400', label: 'API sin conexión', text: 'text-red-400' },
  }[status]

  return (
    <div className="hidden sm:flex items-center gap-2 text-xs" title={API_URL}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={config.text}>{config.label}</span>
    </div>
  )
}
