import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Unauthorized from './pages/auth/Unauthorized'

// Layouts
import StudentLayout from './components/layout/StudentLayout'
import AdminLayout from './components/layout/AdminLayout'

// Student Pages
import Dashboard from './pages/student/Dashboard'
import Tasks from './pages/student/Tasks'
import Placements from './pages/student/Placements'
import DSATracker from './pages/student/DSATracker'
import Calendar from './pages/student/Calendar'
import Habits from './pages/student/Habits'
import CGPA from './pages/student/CGPA'
import Resume from './pages/student/Resume'
import Notes from './pages/student/Notes'
import AIPlanner from './pages/student/AIPlanner'

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview'
import Students from './pages/admin/Students'
import Announcements from './pages/admin/Announcements'
import Export from './pages/admin/Export'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ui/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import { Loader2 } from 'lucide-react'
import { MotionConfig } from 'framer-motion'

function RootRedirect() {
  const { user, role, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    )
  }
  if (!user) return <Home />
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'student') return <Navigate to="/dashboard" replace />
  
  // Fallback while fetching or if role is somehow invalid
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
    </div>
  )
}

/** Root application component — defines all top-level routes */
export default function App() {
  return (
    <AuthProvider>
      <MotionConfig reducedMotion="user">
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="placements" element={<Placements />} />
              <Route path="dsa" element={<DSATracker />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="habits" element={<Habits />} />
              <Route path="cgpa" element={<CGPA />} />
              <Route path="resume" element={<Resume />} />
              <Route path="notes" element={<Notes />} />
              <Route path="ai-planner" element={<AIPlanner />} />
            </Route>

            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<AdminOverview />} />
              <Route path="students" element={<Students />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="export" element={<Export />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ToastProvider>
      </MotionConfig>
    </AuthProvider>
  )
}
