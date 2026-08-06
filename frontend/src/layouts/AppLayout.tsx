import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, ShieldAlert,
  LogOut, Menu, X, GraduationCap,
} from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles: string[]
}

const NAV: NavItem[] = [
  { label: 'My Dashboard',  to: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['student'] },
  { label: 'All Students',  to: '/admin',     icon: <Users size={18} />,           roles: ['admin'] },
  { label: 'Risk Overview', to: '/admin',     icon: <ShieldAlert size={18} />,     roles: ['admin'] },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const role: string = (user as any)?.user_metadata?.role ?? 'student'

  const seen = new Set<string>()
  const visibleNav = NAV.filter((n) => {
    if (!n.roles.includes(role)) return false
    if (seen.has(n.to + n.label)) return false
    seen.add(n.to + n.label)
    return true
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={clsx(
      'flex flex-col bg-tut-blue text-white',
      mobile ? 'w-full' : 'w-64 min-h-screen',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-800">
        <GraduationCap size={28} className="text-tut-gold" />
        <div>
          <p className="font-bold text-sm leading-tight">TUT</p>
          <p className="text-[10px] text-blue-300 leading-tight">Academic Risk Agent</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-4 pb-1">
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-blue-800 text-blue-200 px-2 py-0.5 rounded">
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {visibleNav.map((n) => (
          <NavLink
            key={n.label}
            to={n.to}
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-tut-gold text-white font-semibold'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white',
            )}
          >
            {n.icon}
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-blue-800">
        <p className="text-xs text-blue-300 truncate mb-2">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 z-50"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between bg-tut-blue text-white px-4 py-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={22} className="text-tut-gold" />
            <span className="font-bold text-sm">TUT REW Agent</span>
          </div>
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
