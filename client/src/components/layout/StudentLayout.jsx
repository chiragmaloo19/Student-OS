import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, Briefcase, Code2,
  Calendar, Flame, GraduationCap, FileText, NotebookPen,
  Sparkles, Bell, LogOut, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const studentNavLinks = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { label: 'Tasks', icon: <CheckSquare size={20} />, path: '/dashboard/tasks' },
  { label: 'Placements', icon: <Briefcase size={20} />, path: '/dashboard/placements' },
  { label: 'DSA Tracker', icon: <Code2 size={20} />, path: '/dashboard/dsa' },
  { label: 'Calendar', icon: <Calendar size={20} />, path: '/dashboard/calendar' },
  { label: 'Habits', icon: <Flame size={20} />, path: '/dashboard/habits' },
  { label: 'CGPA', icon: <GraduationCap size={20} />, path: '/dashboard/cgpa' },
  { label: 'Resume', icon: <FileText size={20} />, path: '/dashboard/resume' },
  { label: 'Notes', icon: <NotebookPen size={20} />, path: '/dashboard/notes' },
  { label: 'AI Planner', icon: <Sparkles size={20} />, path: '/dashboard/ai-planner' },
];

/** NotificationBell — bell icon + dropdown with Today's Tasks, Habits, Announcements */
function NotificationBell({ user, profile }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ tasks: [], habits: [], announcements: [] });
  const [loading, setLoading] = useState(false);
  const dropRef = useRef(null);

  const getLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const todayStr = getLocalToday();

      const [
        { data: tasksData },
        { data: habitsData },
        { data: logsData },
        { data: announcementsData },
      ] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('due_date', todayStr)
          .eq('is_completed', false)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('habits')
          .select('id, name')
          .eq('user_id', user.id),
        supabase
          .from('habit_logs')
          .select('habit_id')
          .eq('user_id', user.id)
          .eq('logged_date', todayStr),
        profile?.college_id
          ? supabase
              .from('announcements')
              .select('id, title, created_at')
              .eq('college_id', profile.college_id)
              .order('created_at', { ascending: false })
              .limit(3)
          : Promise.resolve({ data: [] }),
      ]);

      const loggedHabitIds = new Set((logsData || []).map(l => l.habit_id));
      const pendingHabits = (habitsData || []).filter(h => !loggedHabitIds.has(h.id));

      setData({
        tasks: tasksData || [],
        habits: pendingHabits,
        announcements: announcementsData || [],
      });
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when opened
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalCount = data.tasks.length + data.habits.length + data.announcements.length;

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-surface-950" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl z-[200] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
            <span className="text-sm font-bold text-surface-100">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-surface-500 hover:text-surface-200 transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
              </div>
            ) : totalCount === 0 ? (
              <div className="text-center py-8 text-surface-500 text-sm">
                You're all caught up! 🎉
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-surface-800/60">

                {/* Today's Tasks */}
                {data.tasks.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Tasks Due Today ({data.tasks.length})
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {data.tasks.map(task => (
                        <Link
                          key={task.id}
                          to="/dashboard/tasks"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 text-xs text-surface-200 hover:text-brand-300 transition-colors"
                        >
                          <CheckSquare size={11} className="text-brand-400 shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Habits */}
                {data.habits.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Habits Not Logged ({data.habits.length})
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {data.habits.map(habit => (
                        <Link
                          key={habit.id}
                          to="/dashboard/habits"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 text-xs text-surface-200 hover:text-brand-300 transition-colors"
                        >
                          <Flame size={11} className="text-amber-400 shrink-0" />
                          <span className="truncate">{habit.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Announcements */}
                {data.announcements.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Announcements
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {data.announcements.map(ann => (
                        <Link
                          key={ann.id}
                          to="/dashboard"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 text-xs text-surface-200 hover:text-brand-300 transition-colors"
                        >
                          <Bell size={11} className="text-yellow-400 shrink-0" />
                          <span className="truncate">{ann.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function StudentLayout() {
  const { profile, user, signOut } = useAuth();
  const location = useLocation();

  const currentLink = studentNavLinks.find(l => l.path === location.pathname) || studentNavLinks[0];

  return (
    <div className="min-h-screen bg-surface-950 font-lato flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 bg-surface-900 border-r border-surface-800 z-50">
        <div className="p-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">Student <span className="gradient-text">OS</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {studentNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-500/10 text-brand-400' 
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-surface-50 truncate">{profile?.full_name || 'Student'}</p>
              <p className="text-xs text-surface-400 truncate">Student</p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 z-50 flex justify-around items-center h-16 px-2 pb-safe">
        {studentNavLinks.slice(0, 5).map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-brand-400' : 'text-surface-400'
              }`}
            >
              {link.icon}
              <span className="text-[10px]">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen pb-16 md:pb-0">
        <header className="h-16 border-b border-surface-800/60 bg-surface-950/90 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-surface-50">{currentLink.label}</h1>
          <div className="flex items-center gap-3">
            <NotificationBell user={user} profile={profile} />
            <button 
              onClick={() => signOut()}
              className="md:hidden px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
export default StudentLayout;
