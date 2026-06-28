import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function getStoredTheme() {
  return localStorage.getItem('theme') || 'dark'
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => getStoredTheme() === 'dark')

  useEffect(() => {
    const handler = () => setIsDark(document.documentElement.classList.contains('dark'))
    window.addEventListener('theme-change', handler)
    return () => window.removeEventListener('theme-change', handler)
  }, [])

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    applyTheme(next)
    setIsDark(next === 'dark')
    window.dispatchEvent(new Event('theme-change'))
  }

  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all"
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      aria-label="Cambiar tema"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
