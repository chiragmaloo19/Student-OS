import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, Briefcase, Code2,
  Calendar, Flame, GraduationCap, FileText, NotebookPen,
  Sparkles, Bell, LogOut
} from 'lucide-react';

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

export function StudentLayout() {
  const { profile, signOut } = useAuth();
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
            <button className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
              <Bell size={18} />
            </button>
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
  )
}
export default StudentLayout;
