import {
  Users, TrendingUp, Briefcase, Bell,
  Download, Shield,
  BarChart2, CheckCircle
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

/** AdminOverview — TPO/admin view placeholder (populated Day 4) */
const stats = [
  { icon: <Users size={20} />,      label: 'Total Students', value: '342', delta: '+12 this month',  color: 'text-blue-400' },
  { icon: <Briefcase size={20} />,  label: 'Placements',     value: '89',  delta: '26% placement %', color: 'text-green-400' },
  { icon: <TrendingUp size={20} />, label: 'Avg CGPA',       value: '7.9', delta: '↑ 0.2 vs last sem', color: 'text-brand-400' },
  { icon: <CheckCircle size={20} />, label: 'Offers Received', value: '114', delta: 'across 28 companies', color: 'text-purple-400' },
]

const recentActivity = [
  { student: 'Priya Mehta',   action: 'Received offer from',   company: 'Google',      time: '2h ago' },
  { student: 'Arjun Singh',   action: 'Applied to',            company: 'Microsoft',   time: '3h ago' },
  { student: 'Neha Patel',    action: 'Cleared interview at',  company: 'Amazon',      time: '5h ago' },
  { student: 'Rohan Gupta',   action: 'Received offer from',   company: 'Flipkart',    time: '1d ago' },
]

export function AdminOverview() {
  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-surface-50 flex items-center gap-2">
            <Shield size={24} className="text-brand-400" />
            TPO Admin Dashboard
          </h1>
          <p className="text-surface-400 mt-1 text-sm">
            College placement overview — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={15} />}>
          Export CSV
        </Button>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {stats.map((s, i) => (
          <Card key={i} padding="md">
            <div className={`${s.color} mb-3`}>{s.icon}</div>
            <p className="text-2xl font-black text-surface-50">{s.value}</p>
            <p className="text-sm font-semibold text-surface-200 mt-0.5">{s.label}</p>
            <p className="text-xs text-surface-500 mt-1">{s.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Recent activity ────────────────────────────── */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Card padding="md">
            <Card.Header>
              <h2 className="font-bold text-surface-100 flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-400" /> Recent Student Activity
              </h2>
            </Card.Header>
            <div className="flex flex-col gap-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 text-xs font-bold">
                      {a.student.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-200">{a.student}</p>
                      <p className="text-xs text-surface-500">
                        {a.action} <span className="text-brand-400">{a.company}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-surface-600">{a.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Quick actions ──────────────────────────────── */}
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <Card padding="md">
            <Card.Header>
              <h2 className="font-bold text-surface-100">Quick Actions</h2>
            </Card.Header>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Post Announcement', icon: <Bell size={15} /> },
                { label: 'View All Students', icon: <Users size={15} /> },
                { label: 'Export Report',      icon: <Download size={15} /> },
                { label: 'Manage Companies',   icon: <Briefcase size={15} /> },
              ].map((action, i) => (
                <Button key={i} variant="secondary" size="sm" icon={action.icon} className="justify-start">
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Day notice */}
          <Card padding="md" glass className="border-brand-500/30 mt-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <p className="text-xs font-bold text-brand-400">Day 1 Complete</p>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Full admin features — student lists, announcements, export — arrive on Day 4.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
