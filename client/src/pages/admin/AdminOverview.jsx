import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Briefcase, TrendingUp, Award,
  Shield, BarChart2, Bell, ArrowRight,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import api from '../../lib/api'

/** Skeleton shimmer placeholder for a stat card */
function StatSkeleton() {
  return (
    <div className="bg-surface-900 border border-surface-700/60 rounded-2xl p-5 flex flex-col gap-3">
      <div className="w-5 h-5 rounded animate-shimmer" />
      <div className="h-8 w-16 rounded animate-shimmer" />
      <div className="h-4 w-24 rounded animate-shimmer" />
    </div>
  )
}

/** Format a number nicely, handling null/undefined */
function fmt(val) {
  if (val === null || val === undefined) return 'N/A'
  return String(val)
}

/** Single stat card */
function StatCard({ icon, label, value, color, delay }) {
  return (
    <Card padding="md" className="animate-slide-up" style={{ animationDelay: delay }}>
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-2xl font-black text-surface-50">{fmt(value)}</p>
      <p className="text-sm font-semibold text-surface-300 mt-0.5">{label}</p>
    </Card>
  )
}

/** Top companies horizontal bar chart — plain Tailwind divs, no library */
function TopCompaniesChart({ companies }) {
  if (!companies || companies.length === 0) {
    return <p className="text-surface-500 text-sm">No placement data yet.</p>
  }
  const max = Math.max(...companies.map(c => c.count))
  return (
    <div className="flex flex-col gap-3">
      {companies.map((c, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-surface-300 w-28 shrink-0 truncate font-semibold">{c.company}</span>
          <div className="flex-1 bg-surface-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
              style={{ width: `${(c.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-surface-400 w-6 text-right shrink-0">{c.count}</span>
        </div>
      ))}
    </div>
  )
}

/** Format announcement date as short readable string */
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** AdminOverview — real data TPO dashboard with stats, top companies, recent announcements */
export default function AdminOverview() {
  const [stats,         setStats]         = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  /** Fetch overview stats and announcements in parallel on mount */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [overviewRes, announcementsRes] = await Promise.all([
          api.get('/api/admin/overview'),
          api.get('/api/admin/announcements'),
        ])
        if (overviewRes.data.success) setStats(overviewRes.data.data.stats)
        if (announcementsRes.data.success) setAnnouncements(announcementsRes.data.data.announcements.slice(0, 3))
      } catch (err) {
        console.error('Admin overview load error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-4 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-surface-50">TPO Admin Dashboard</h1>
          <p className="text-surface-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards — 2×2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={<Users size={20} />}      label="Total Students"      value={stats?.totalStudents}      color="text-blue-400"   delay="0ms" />
            <StatCard icon={<Briefcase size={20} />}  label="Total Applications"  value={stats?.totalApplications}  color="text-yellow-400" delay="50ms" />
            <StatCard icon={<Award size={20} />}       label="Offers Received"     value={stats?.offersReceived}     color="text-green-400"  delay="100ms" />
            <StatCard icon={<TrendingUp size={20} />}  label="Average CGPA"        value={stats?.averageCGPA ?? 'N/A'} color="text-brand-400" delay="150ms" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top companies bar chart */}
        <div className="lg:col-span-2">
          <Card padding="md">
            <Card.Header>
              <h2 className="font-bold text-surface-100 flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-400" />
                Top Companies by Applications
              </h2>
            </Card.Header>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 w-24 rounded animate-shimmer" />
                    <div className="flex-1 h-2 rounded-full animate-shimmer" />
                    <div className="h-4 w-4 rounded animate-shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <TopCompaniesChart companies={stats?.topCompanies} />
            )}
          </Card>
        </div>

        {/* Recent announcements */}
        <div>
          <Card padding="md">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-surface-100 flex items-center gap-2">
                  <Bell size={16} className="text-brand-400" />
                  Recent Announcements
                </h2>
                <Link
                  to="/admin/announcements"
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  View All <ArrowRight size={12} />
                </Link>
              </div>
            </Card.Header>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="py-2 space-y-2">
                    <div className="h-4 rounded animate-shimmer w-3/4" />
                    <div className="h-3 rounded animate-shimmer w-1/2" />
                  </div>
                ))}
              </div>
            ) : announcements.length > 0 ? (
              <div className="flex flex-col gap-3">
                {announcements.map(a => (
                  <div key={a.id} className="py-2 border-b border-surface-800/60 last:border-0">
                    <p className="text-sm font-semibold text-surface-200 truncate">{a.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{fmtDate(a.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-sm">No announcements yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
