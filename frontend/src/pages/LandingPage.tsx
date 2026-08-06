import { Link } from 'react-router-dom'
import { ShieldAlert, BarChart2, Bell, Users } from 'lucide-react'

const features = [
  {
    icon: <BarChart2 size={24} className="text-blue-400" />,
    title: 'Real-time Risk Scoring',
    desc: 'AI-driven analysis of marks, attendance, LMS activity and engagement — surfacing at-risk students before they fall behind.',
  },
  {
    icon: <Bell size={24} className="text-amber-400" />,
    title: 'Automated Interventions',
    desc: 'Configurable risk rules trigger prioritised intervention recommendations so academic advisors act on what matters most.',
  },
  {
    icon: <Users size={24} className="text-green-400" />,
    title: 'Student-Centric Profiles',
    desc: 'Every student gets a longitudinal profile — mark breakdowns, attendance trends, and full intervention history in one place.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">
        {/* Logo — no TUT text */}
        <div className="flex items-center gap-2 font-bold text-xl">
          <ShieldAlert className="text-blue-400" size={22} />
          <span>REW</span>
        </div>

        {/* Nav login options */}
        <div className="flex gap-3">
          <Link
            to="/admin-login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 transition-colors"
          >
            Admin Login
          </Link>
          <Link
            to="/student-login"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors"
          >
            Student Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-6 max-w-3xl mx-auto">
        <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
          Tshwane University of Technology
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Academic Risk Early Warning System
        </h1>
        <p className="text-slate-300 text-lg max-w-xl">
          Identify at-risk students early, automate intervention workflows, and keep every student on track — powered by AI-driven academic analytics.
        </p>

        {/* Two clearly separated login sections */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-sm">
          <Link
            to="/admin-login"
            className="flex-1 px-6 py-3 rounded-xl border border-slate-500 hover:border-slate-300 font-semibold text-sm transition-colors text-center"
          >
            Admin Login
          </Link>
          <Link
            to="/student-login"
            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-colors shadow-lg text-center"
          >
            Student Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-20 grid sm:grid-cols-3 gap-6">
        {features.map(f => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
