import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Badge } from '../ui'

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [showFloating, setShowFloating] = useState(false)

  /* ── local today ─────────────────────────────────────────────── */
  const d = new Date()
  const localTodayDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const isOverdue = !task.is_completed && task.due_date && task.due_date < localTodayDate

  /* ── helpers ─────────────────────────────────────────────────── */
  const priorityColorMap = { low: 'green', medium: 'yellow', high: 'red' }
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
  const formatCategory = (c) => c === 'dsa' ? 'DSA' : capitalize(c)
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date'
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  /* ── handle toggle with floating badge ───────────────────────── */
  const handleToggle = () => {
    if (!task.is_completed) {
      setShowFloating(true)
      setTimeout(() => setShowFloating(false), 1100)
    }
    onToggle(task)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015, transition: { duration: 0.15 } }}
      className={`relative glass p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
        task.is_completed
          ? 'border-surface-800/40 opacity-70'
          : 'border-surface-800 hover:border-brand-500/30 hover:shadow-brand'
      }`}
    >
      {/* ── floating "✓ Task Completed" badge ─────────────────── */}
      <AnimatePresence>
        {showFloating && (
          <motion.div
            key="float"
            initial={{ opacity: 0, y: 0, scale: 0.85 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -44, scale: 0.9 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-glow pointer-events-none z-10 whitespace-nowrap"
          >
            ✓ Task Completed
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── top: checkbox + text ──────────────────────────────── */}
      <div className="flex items-start gap-3">
        {/* Animated checkbox */}
        <motion.button
          type="button"
          onClick={handleToggle}
          whileTap={{ scale: 0.82 }}
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-1 transition-colors ${
            task.is_completed
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-surface-500 hover:border-brand-500'
          }`}
          aria-label={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <AnimatePresence>
            {task.is_completed && (
              <motion.svg
                key="check"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-3.5 h-3.5 stroke-2 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Title + animated strikethrough */}
        <div className="flex-1 min-w-0">
          <div className="relative inline-block max-w-full">
            <h3 className={`font-bold text-base leading-tight break-words transition-colors duration-300 ${
              task.is_completed ? 'text-surface-500 italic' : 'text-surface-100'
            }`}>
              {task.title}
            </h3>
            {/* Animated strikethrough line */}
            <AnimatePresence>
              {task.is_completed && (
                <motion.div
                  key="strike"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  className="absolute top-1/2 left-0 right-0 h-[2px] bg-surface-500 -translate-y-1/2 rounded-full"
                />
              )}
            </AnimatePresence>
          </div>

          {task.description && (
            <p className={`text-sm mt-1.5 break-words ${
              task.is_completed ? 'text-surface-600 line-through' : 'text-surface-400'
            }`}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* ── bottom: badges + actions ──────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <Badge text={capitalize(task.priority)} color={priorityColorMap[task.priority] || 'gray'} size="sm" />
          <Badge text={formatCategory(task.category)} color="brand" size="sm" />
          <div className="flex items-center gap-1.5 text-xs font-semibold ml-1">
            {isOverdue ? (
              <span className="text-red-400 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> Overdue
              </span>
            ) : task.due_date ? (
              <span className="text-surface-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(task.due_date)}
              </span>
            ) : (
              <span className="text-surface-500">No due date</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isConfirmingDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 bg-surface-800 p-0.5 rounded-lg border border-surface-700"
              >
                <span className="text-xs font-semibold text-surface-300 px-2">Are you sure?</span>
                <button
                  onClick={() => { onDelete(task.id); setIsConfirmingDelete(false) }}
                  className="text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-md transition-all"
                >Yes</button>
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="text-xs font-semibold hover:bg-surface-700 text-surface-400 hover:text-surface-200 px-2 py-1 rounded-md transition-all"
                >No</button>
              </motion.div>
            ) : (
              <motion.div key="btns" className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={() => onEdit(task)}
                  disabled={task.is_completed}
                  className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-all disabled:opacity-30"
                  title="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
