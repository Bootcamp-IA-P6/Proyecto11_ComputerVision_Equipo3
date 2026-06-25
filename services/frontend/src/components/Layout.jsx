import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Film, ImageIcon, History, Menu, X, Scan } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import ApiStatus from './ApiStatus'

const navItems = [
  { to: '/', label: 'Vídeo', icon: Film, end: true },
  { to: '/image', label: 'Imagen', icon: ImageIcon },
  { to: '/history', label: 'Historial', icon: History },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-1 mb-10">
        <div className="w-9 h-9 rounded-lg bg-brand-green flex items-center justify-center">
          <Scan className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white tracking-tight">
            LogoVision
          </p>
          <p className="text-[11px] text-slate-500">YOLO11s · Equipo 3</p>
        </div>
      </div>

      <nav className="space-y-0.5 flex-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-green/10 text-brand-green font-medium'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[11px] text-slate-500 leading-relaxed px-1">
          mAP@50 <span className="text-brand-green font-medium">0.891</span>
          {' · '}
          <a
            href="https://huggingface.co/Marco13423/logo-detection-yolo11s"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-green transition-colors"
          >
            Modelo HF
          </a>
        </p>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] flex">
      <aside className="hidden lg:flex flex-col w-56 fixed inset-y-0 left-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f0f10] p-5 z-30">
        <NavContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0f0f10] border-r border-slate-200 dark:border-slate-800 p-5 z-50 lg:hidden flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400">
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      <div className="flex-1 lg:pl-56 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0a0a0b]/90 backdrop-blur-md">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500">
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden font-semibold text-slate-900 dark:text-white text-sm">LogoVision</div>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <ApiStatus />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8 page-enter max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}
