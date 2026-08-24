import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, LayoutDashboard, LogOut, ShieldAlert, Users } from 'lucide-react'
import clsx from 'clsx'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const isAdmin = user?.email?.includes('admin') || user?.user_metadata?.role === 'admin'

  const navItems = [
    { to: '/dashboard',  label: 'My Dashboard', icon: <LayoutDashboard size={18} />, show: true },
    { to: '/admin',      label: 'Admin Panel',  icon: <Users size={18} />,           show: isAdmin },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
            <ShieldAlert size={20} />
            TUT REW
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.filter(i => i.show).map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(item.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <BookOpen size={12} /> TUT Academic Risk Early Warning System
        </span>
      </footer>
    </div>
  )
}
