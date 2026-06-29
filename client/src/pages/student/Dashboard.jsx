import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare, Code2, Briefcase, TrendingUp,
  Flame, ArrowRight,
  Calendar, BookOpen, Target, Bell
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

/** Dashboard — student dashboard placeholder (populated Day 3–6) */
const modules = [
  { icon: <CheckSquare size={20} />, label: 'Tasks',          badge: 'Task Manager',  color: 'blue',   path: '/dashboard/tasks' },
  { icon: <Code2 size={20} />,       label: 'DSA Tracker',    badge: 'DSA Progress',  color: 'brand',  path: '/dashboard/dsa' },
  { icon: <Briefcase size={20} />,   label: 'Placement Hub',  badge: 'Job Pipeline',  color: 'yellow', path: '/dashboard/placements' },
  { icon: <TrendingUp size={20} />,  label: 'CGPA',           badge: 'Grades',        color: 'green',  path: '/dashboard/cgpa' },
  { icon: <BookOpen size={20} />,    label: 'Study Plans',    badge: 'AI-powered',    color: 'purple', path: '/dashboard/ai-planner' },
  { icon: <Flame size={20} />,       label: 'Habits',         badge: 'Habits',        color: 'red',    path: '/dashboard/habits' },
]

export function Dashboard() {
  const { profile, user } = useAuth();
  
  const [announcements, setAnnouncements] = useState([])
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null)

  const [loading, setLoading] = useState(true)
  const [tasksDue, setTasksDue] = useState({ count: 0, list: [] })
  const [activeApps, setActiveApps] = useState(0)
  const [dsaSolved, setDsaSolved] = useState(0)
  const [cgpa, setCgpa] = useState('N/A')
  const [pipeline, setPipeline] = useState({ applied: 0, oa: 0, interview: 0, offer: 0, rejected: 0 })
  const [habitsToday, setHabitsToday] = useState({ total: 0, logged: 0 })

  /** Format ISO date as relative time string */
  const getRelativeDate = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days/7) + ' weeks ago';
    return Math.floor(days/30) + ' months ago';
  };

  const getLocalTodayDate = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const getStartOfWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0,0,0,0)
    return d.toISOString()
  }

  const fetchDashboardData = async () => {
    if (!user) return
    setLoading(true)

    const todayDate = getLocalTodayDate()
    const weekStart = getStartOfWeek()

    try {
      const [
        { data: tasksData },
        { data: placementsData },
        { data: dsaData },
        { data: cgpaData },
        { data: announcementsData },
        { data: habitsData },
        { data: habitLogsData },
      ] = await Promise.all([
        supabase.from('tasks').select('id, title, is_completed, due_date').eq('user_id', user.id).eq('due_date', todayDate).eq('is_completed', false).order('created_at', { ascending: false }),
        supabase.from('placements').select('id, status').eq('user_id', user.id),
        supabase.from('dsa_problems').select('id').eq('user_id', user.id).eq('is_solved', true).gte('solved_at', weekStart),
        supabase.from('cgpa_records').select('sgpa').eq('user_id', user.id),
        profile?.college_id ? supabase.from('announcements').select('id, title, content, created_at').eq('college_id', profile.college_id).order('created_at', { ascending: false }).limit(2) : Promise.resolve({ data: [] }),
        supabase.from('habits').select('id').eq('user_id', user.id),
        supabase.from('habit_logs').select('habit_id').eq('user_id', user.id).eq('logged_date', todayDate),
      ])

      // Tasks
      const pendingTasks = tasksData || []
      setTasksDue({ count: pendingTasks.length, list: pendingTasks.slice(0, 5) })

      // Placements
      const pl = placementsData || []
      let act = 0
      const pip = { applied: 0, oa: 0, interview: 0, offer: 0, rejected: 0 }
      pl.forEach(p => {
        if (p.status !== 'offer' && p.status !== 'rejected') act++
        if (pip[p.status] !== undefined) pip[p.status]++
      })
      setActiveApps(act)
      setPipeline(pip)

      // DSA
      setDsaSolved(dsaData ? dsaData.length : 0)

      // CGPA
      if (cgpaData && cgpaData.length > 0) {
        const avg = cgpaData.reduce((sum, r) => sum + parseFloat(r.sgpa), 0) / cgpaData.length
        setCgpa(avg.toFixed(2))
      } else {
        setCgpa('N/A')
      }

      // Announcements
      if (announcementsData) setAnnouncements(announcementsData)

      // Habits today
      const totalHabits = (habitsData || []).length
      const loggedHabitIds = new Set((habitLogsData || []).map(l => l.habit_id))
      const loggedToday = (habitsData || []).filter(h => loggedHabitIds.has(h.id)).length
      setHabitsToday({ total: totalHabits, logged: loggedToday })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user, profile?.college_id])

  const handleTaskComplete = async (taskId) => {
    // Optimistic
    setTasksDue(prev => ({
      count: Math.max(0, prev.count - 1),
      list: prev.list.filter(t => t.id !== taskId)
    }))
    await supabase.from('tasks').update({ is_completed: true }).eq('id', taskId)
  }

  const toggleAnnouncement = (id) => {
    setExpandedAnnouncement(prev => prev === id ? null : id)
  }

  const stats = [
    { label: 'Tasks Due Today',  value: loading ? '...' : (tasksDue.count === 0 ? '0' : tasksDue.count), sub: 'pending tasks' },
    { label: 'DSA Problems',     value: loading ? '...' : (dsaSolved === 0 ? '0' : dsaSolved),      sub: 'solved this week' },
    { label: 'Active Apps',      value: loading ? '...' : (activeApps === 0 ? '0' : activeApps),     sub: 'in progress' },
    { label: 'Current CGPA',     value: loading ? '...' : cgpa,           sub: 'running avg' },
  ]

  const pipelineStages = [
    { key: 'applied', label: 'Applied', color: 'text-blue-400 bg-blue-500/10' },
    { key: 'oa', label: 'OA', color: 'text-yellow-400 bg-yellow-500/10' },
    { key: 'interview', label: 'Interview', color: 'text-purple-400 bg-purple-500/10' },
    { key: 'offer', label: 'Offer', color: 'text-green-400 bg-green-500/10' },
    { key: 'rejected', label: 'Rejected', color: 'text-red-400 bg-red-500/10' },
  ]
  
  return (
    <div className="max-w-7xl mx-auto py-4">

      {/* ── Welcome header ───────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-surface-50">
              {(() => {
                const h = new Date().getHours()
                const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
                return `${greeting}, ${profile?.full_name?.split(' ')[0] || 'Student'} 👋`
              })()}
            </h1>
            <p className="text-surface-400 mt-1 text-sm">
              <Calendar size={14} className="inline mr-1" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge text="Student" color="brand" dot />
        </div>

        {/* Daily summary banner */}
        {!loading && (
          <div className="flex flex-wrap gap-3">
            {/* Tasks banner */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold ${
              tasksDue.count === 0
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <CheckSquare size={14} className="shrink-0" />
              {tasksDue.count === 0
                ? 'All tasks done today!'
                : `${tasksDue.count} task${tasksDue.count > 1 ? 's' : ''} due today`}
            </div>

            {/* Habits banner */}
            {habitsToday.total > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold ${
                habitsToday.logged >= habitsToday.total
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                <Flame size={14} className="shrink-0" />
                {habitsToday.logged >= habitsToday.total
                  ? `All ${habitsToday.total} habits logged today!`
                  : `${habitsToday.logged}/${habitsToday.total} habits logged today`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {stats.map((s, i) => (
          <Card key={i} padding="md" className="text-center">
            {loading ? (
              <div className="h-8 w-16 bg-surface-800 rounded animate-shimmer mx-auto" />
            ) : (
              <p className="text-2xl font-black text-brand-400">{s.value}</p>
            )}
            <p className="text-sm font-semibold text-surface-200 mt-0.5">{s.label}</p>
            <p className="text-xs text-surface-500 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Dashboard Content ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Pipeline & Tasks) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* ── Placement Pipeline Mini View ───────────────── */}
          <Link to="/dashboard/placements" className="block group">
            <Card padding="md" className="animate-slide-up border border-surface-800/80 group-hover:border-brand-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-surface-200 flex items-center gap-2 group-hover:text-brand-300 transition-colors">
                  <Briefcase size={16} className="text-brand-400" /> Placement Hub
                </h2>
                <span className="text-xs font-semibold text-brand-500 bg-brand-500/10 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  View full
                </span>
              </div>
              {loading ? (
                <div className="h-16 w-full bg-surface-800 rounded-xl animate-shimmer" />
              ) : (
                <div className="flex flex-wrap gap-3">
                  {pipelineStages.map(stage => (
                    <div key={stage.key} className={`flex-1 min-w-[80px] p-3 rounded-xl flex flex-col items-center justify-center text-center ${stage.color}`}>
                      <span className="text-xs font-semibold uppercase opacity-80">{stage.label}</span>
                      <span className="text-xl font-bold">{pipeline[stage.key]}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Link>

          {/* ── Tasks Due Today List ───────────────────────── */}
          <Card padding="md" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-base font-bold text-surface-200 mb-4 flex items-center gap-2">
              <CheckSquare size={16} className="text-brand-400" /> Tasks Due Today
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="h-10 w-full bg-surface-800 rounded-xl animate-shimmer" />)}
              </div>
            ) : tasksDue.list.length > 0 ? (
              <div className="flex flex-col gap-2">
                {tasksDue.list.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-surface-900 border border-surface-800 rounded-xl hover:border-surface-700 transition-colors">
                    <button
                      onClick={() => handleTaskComplete(task.id)}
                      className="w-5 h-5 rounded border border-surface-600 flex items-center justify-center text-transparent hover:border-brand-500 hover:text-brand-500 transition-colors"
                    >
                      <CheckSquare size={14} />
                    </button>
                    <span className="text-sm text-surface-100 flex-1 truncate">{task.title}</span>
                  </div>
                ))}
                {tasksDue.count > 5 && (
                  <Link to="/dashboard/tasks" className="text-xs text-brand-400 hover:underline text-center mt-2 block">
                    View all {tasksDue.count} tasks...
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-sm text-surface-500 text-center py-4 bg-surface-900 rounded-xl border border-surface-800 border-dashed">
                No tasks due today.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Announcements) */}
        <div className="flex flex-col gap-6">
          {announcements.length > 0 && (
            <Card padding="md" className="border-yellow-500/20 animate-fade-in h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-yellow-400" />
                <p className="text-base font-bold text-surface-200">Announcements</p>
              </div>
              <div className="flex flex-col gap-3">
                {announcements.map(a => {
                  const isExpanded = expandedAnnouncement === a.id;
                  const contentPreview = a.content ? (a.content.length > 120 ? a.content.substring(0, 120) + '...' : a.content) : '';
                  return (
                    <div 
                      key={a.id} 
                      onClick={() => toggleAnnouncement(a.id)}
                      className="flex flex-col p-3 rounded-xl bg-surface-900 border border-surface-800 cursor-pointer hover:border-yellow-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-surface-100">{a.title}</p>
                        <span className="text-[10px] text-surface-500 whitespace-nowrap bg-surface-800 px-2 py-0.5 rounded">{getRelativeDate(a.created_at)}</span>
                      </div>
                      
                      {isExpanded ? (
                        <div className="mt-2 text-xs text-surface-300 leading-relaxed border-t border-surface-800 pt-2">
                          {a.content || 'No description provided.'}
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-surface-400 leading-relaxed">
                          {contentPreview || 'No description provided.'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
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

    </div>
  )
}

export default Dashboard
