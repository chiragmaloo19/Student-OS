import { Link } from 'react-router-dom'
import {
  CheckSquare, Code2, Briefcase, TrendingUp,
  GraduationCap, Flame, ArrowRight,
  Calendar, BookOpen, Target
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

/** Dashboard — student dashboard placeholder (populated Day 3–6) */
const modules = [
  { icon: <CheckSquare size={20} />, label: 'Tasks',          badge: '3 due today',   color: 'blue',   path: '/dashboard/tasks' },
  { icon: <Code2 size={20} />,       label: 'DSA Tracker',    badge: '12-day streak', color: 'brand',  path: '/dashboard/dsa' },
  { icon: <Briefcase size={20} />,   label: 'Placement Hub',  badge: '2 pending',     color: 'yellow', path: '/dashboard/placement' },
  { icon: <TrendingUp size={20} />,  label: 'CGPA',           badge: '9.0 GPA',       color: 'green',  path: '/dashboard/cgpa' },
  { icon: <BookOpen size={20} />,    label: 'Study Plans',    badge: 'AI-powered',    color: 'purple', path: '/dashboard/ai-planner' },
  { icon: <Flame size={20} />,       label: 'Habits',         badge: '5 active',      color: 'red',    path: '/dashboard/habits' },
]

const stats = [
  { label: 'Tasks Done',       value: '24',  sub: 'this week' },
  { label: 'DSA Problems',     value: '147', sub: 'total solved' },
  { label: 'Applications',     value: '8',   sub: 'in progress' },
  { label: 'Current CGPA',     value: '9.0', sub: 'semester 6' },
]

export function Dashboard() {
  const { profile } = useAuth();
  
  return (
    <div className="max-w-7xl mx-auto py-4">

      {/* ── Welcome header ───────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-surface-50">
            Good morning, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-surface-400 mt-1 text-sm">
            <Calendar size={14} className="inline mr-1" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge text="Student" color="brand" dot />
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {stats.map((s, i) => (
          <Card key={i} padding="md" className="text-center">
            <p className="text-2xl font-black text-brand-400">{s.value}</p>
            <p className="text-sm font-semibold text-surface-200 mt-0.5">{s.label}</p>
            <p className="text-xs text-surface-500 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Module grid ──────────────────────────────────── */}
      <h2 className="text-lg font-bold text-surface-200 mb-4 flex items-center gap-2">
        <Target size={18} className="text-brand-400" /> Your Modules
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {modules.map((m, i) => (
          <Link key={i} to={m.path} className="block">
            <Card
              hover
              padding="md"
              className="animate-slide-up group h-full"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/25 transition-colors">
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-100">{m.label}</p>
                    <Badge text={m.badge} color={m.color} size="sm" />
                  </div>
                </div>
                <ArrowRight size={16} className="text-surface-600 group-hover:text-brand-400 transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Day 1 notice ─────────────────────────────────── */}
      <Card padding="md" glass className="border-brand-500/30 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <p className="text-sm text-surface-300">
            <span className="text-brand-400 font-bold">Day 1 complete!</span> Foundation scaffold built.
            Auth, real data, and module pages arrive on Days 2–4.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
