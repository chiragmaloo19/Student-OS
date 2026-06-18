import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button, PageLayout } from '../../components/ui'
import TaskStats from '../../components/tasks/TaskStats'
import TaskFilters from '../../components/tasks/TaskFilters'
import TaskForm from '../../components/tasks/TaskForm'
import TaskCard from '../../components/tasks/TaskCard'

/* ── shimmer skeleton ─────────────────────────────────────────── */
function TaskCardSkeleton() {
  return (
    <div className="glass p-5 rounded-2xl border border-surface-800/60 flex flex-col justify-between gap-4 h-36 overflow-hidden">
      <div className="flex gap-3">
        <div className="w-5 h-5 rounded-md animate-shimmer shrink-0 mt-1" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded animate-shimmer w-3/4" />
          <div className="h-3 rounded animate-shimmer w-1/2" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-surface-800/40">
        <div className="flex gap-2">
          <div className="h-5 rounded-full animate-shimmer w-14" />
          <div className="h-5 rounded-full animate-shimmer w-14" />
        </div>
        <div className="h-6 rounded animate-shimmer w-16" />
      </div>
    </div>
  )
}

/* ── stagger container ────────────────────────────────────────── */
const listVariants = {
  animate: { transition: { staggerChildren: 0.055 } },
}

const TABS = [
  { id: 'today',     label: 'Today'     },
  { id: 'all',       label: 'All Tasks' },
  { id: 'completed', label: 'Completed' },
]

export default function Tasks() {
  const { user }      = useAuth()
  const { showToast } = useToast()

  const [tasks,            setTasks]            = useState([])
  const [loading,          setLoading]          = useState(true)
  const [activeTab,        setActiveTab]        = useState('today')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [isFormOpen,       setIsFormOpen]       = useState(false)
  const [editingTask,      setEditingTask]      = useState(null)
  const [formLoading,      setFormLoading]      = useState(false)

  /* daily-banner state — only triggered by user action, never on load */
  const [showDailyBanner,  setShowDailyBanner]  = useState(false)
  const bannerTimer = useRef(null)

  /* ── local today ─────────────────────────────────────────────── */
  const getLocalToday = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const localTodayDate = getLocalToday()

  /* ── fetch ───────────────────────────────────────────────────── */
  const fetchTasks = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      showToast('Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [user])

  /* ── filter ──────────────────────────────────────────────────── */
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'today'     && task.due_date !== localTodayDate) return false
    if (activeTab === 'completed' && !task.is_completed)               return false
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false
    if (selectedPriority !== 'all' && task.priority  !== selectedPriority) return false
    return true
  })

  /* ── check daily completion (call AFTER optimistic state update) */
  const checkDailyCompletion = (updatedTasks) => {
    const todayTasks = updatedTasks.filter(t => t.due_date === localTodayDate)
    if (todayTasks.length > 0 && todayTasks.every(t => t.is_completed)) {
      setShowDailyBanner(true)
      clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setShowDailyBanner(false), 2000)
    }
  }

  /* ── add / edit ──────────────────────────────────────────────── */
  const handleFormSubmit = async (formData) => {
    if (!user) return
    try {
      setFormLoading(true)
      if (editingTask) {
        const { data, error } = await supabase
          .from('tasks').update(formData).eq('id', editingTask.id).select()
        if (error) throw error
        setTasks(prev => prev.map(t => t.id === editingTask.id ? data[0] : t))
        showToast('Task updated successfully', 'success')
      } else {
        const { data, error } = await supabase
          .from('tasks').insert({ ...formData, user_id: user.id }).select()
        if (error) throw error
        setTasks(prev => [data[0], ...prev])
        showToast('Task created successfully', 'success')
      }
      setIsFormOpen(false)
      setEditingTask(null)
    } catch (err) {
      console.error('Error saving task:', err)
      showToast(err.message || 'Failed to save task', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  /* ── toggle complete (optimistic) ────────────────────────────── */
  const handleToggleComplete = async (task) => {
    const original     = [...tasks]
    const updatedStatus = !task.is_completed
    const updated = tasks.map(t => t.id === task.id ? { ...t, is_completed: updatedStatus } : t)
    setTasks(updated)

    /* only trigger daily banner on a real completion action */
    if (updatedStatus) checkDailyCompletion(updated)

    try {
      const { error } = await supabase
        .from('tasks').update({ is_completed: updatedStatus }).eq('id', task.id)
      if (error) throw error
      showToast(updatedStatus ? 'Task completed!' : 'Task marked incomplete', 'success')
    } catch (err) {
      console.error('Error toggling task:', err)
      setTasks(original)
      showToast('Failed to update task. Reverting.', 'error')
    }
  }

  /* ── delete ──────────────────────────────────────────────────── */
  const handleDeleteTask = async (id) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      setTasks(prev => prev.filter(t => t.id !== id))
      showToast('Task deleted successfully', 'success')
    } catch (err) {
      console.error('Error deleting task:', err)
      showToast('Failed to delete task', 'error')
    }
  }

  return (
    <PageLayout title="Task Manager">
      <div className="flex flex-col gap-6">

        {/* Header CTA */}
        <div className="flex items-center justify-between">
          <p className="text-surface-400 text-sm hidden md:block">
            Organize, prioritize, and track your daily preparation goals.
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { setEditingTask(null); setIsFormOpen(true) }}
            className="rounded-xl ml-auto"
          >
            Add Task
          </Button>
        </div>

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* ── Daily completion banner ──────────────────────────── */}
        <AnimatePresence>
          {showDailyBanner && (
            <motion.div
              key="daily-banner"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-brand-500/10 border border-brand-500/30 rounded-2xl px-6 py-4 text-center text-brand-300 font-bold text-base shadow-brand backdrop-blur-md"
            >
              🎉 All Today's Tasks Completed!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="border-b border-surface-800 flex gap-6 relative">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold relative transition-colors ${
                activeTab === tab.id ? 'text-brand-400' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-full shadow-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <TaskFilters
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          selectedPriority={selectedPriority}  setSelectedPriority={setSelectedPriority}
        />

        {/* ── Task list ─────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <TaskCardSkeleton key={i} />)}
          </div>
        ) : filteredTasks.length > 0 ? (
          <motion.div
            key={activeTab}
            variants={listVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence initial={false}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onEdit={(t) => { setEditingTask(t); setIsFormOpen(true) }}
                  onDelete={handleDeleteTask}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── Empty state ─────────────────────────────────────── */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.3 }}
            className="glass p-12 rounded-3xl text-center flex flex-col items-center border border-surface-800/60 max-w-lg mx-auto w-full mt-4"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center text-surface-400 mb-4 border border-surface-700/50"
            >
              <Plus className="w-8 h-8" />
            </motion.div>
            <h3 className="text-lg font-bold text-surface-100 mb-1">No tasks found</h3>
            <p className="text-sm text-surface-400 mb-6 max-w-xs">
              {activeTab === 'today'
                ? "No tasks due today. Add one to stay on track!"
                : activeTab === 'completed'
                ? "No completed tasks yet. Check one off to see it here!"
                : "No tasks match your filters. Create a new task or adjust your filters."}
            </p>
            <Button variant="primary" onClick={() => { setEditingTask(null); setIsFormOpen(true) }} className="rounded-xl">
              Add First Task
            </Button>
          </motion.div>
        )}

        {/* Form drawer */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingTask(null) }}
          onSubmit={handleFormSubmit}
          task={editingTask}
          loading={formLoading}
        />
      </div>
    </PageLayout>
  )
}
