import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Upload,
  BarChart3,
  History,
  Menu,
  X,
  ScanEye,
  ExternalLink,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { to: '/', label: 'Analizar', icon: Upload, end: true },
  { to: '/history', label: 'Historial', icon: History },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setThemeTick] = useState(0)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = () => setThemeTick((t) => t + 1)
    window.addEventListener('theme-change', handler)
    return () => window.removeEventListener('theme-change', handler)
  }, [])

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center shadow-lg shadow-brand-green/20">
          <ScanEye className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
            Logo<span className="text-brand-green">Vision</span>
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Brand Analytics
          </p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-green/15 text-brand-green border border-brand-green/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="px-2">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-brand-green" />
            <span className="text-xs font-semibold text-slate-300">Modelo activo</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            YOLO11s · mAP@50 <span className="text-brand-green font-semibold">0.891</span>
          </p>
          <a
            href="https://huggingface.co/Marco13423/logo-detection-yolo11s"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-green hover:text-brand-green-light mt-2 transition-colors"
          >
            Hugging Face
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[10px] text-slate-600 px-2">
          Equipo 3 · F5 Bootcamp IA
        </p>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-5 z-30">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 z-50 lg:hidden flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <ScanEye className="w-5 h-5 text-brand-green" />
              <span className="font-bold text-slate-900 dark:text-white">
                Logo<span className="text-brand-green">Vision</span>
              </span>
            </div>
            <div className="hidden lg:block" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 page-enter">{children}</main>

        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-5 px-4 text-center">
          <p className="text-xs text-slate-600">
            Logo Detection · Análisis de marcas en vídeos publicitarios con Computer Vision
          </p>
        </footer>
      </div>
    </div>
  )
}
