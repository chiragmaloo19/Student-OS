import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button, Input } from '../ui'

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit:    { x: '100%', transition: { duration: 0.22, ease: 'easeIn' } },
}

export default function TaskForm({ 
  isOpen, onClose, onCancel, onSubmit, task = null, loading = false,
  title, setTitle,
  description, setDescription,
  dueDate, setDueDate,
  priority, setPriority,
  category, setCategory,
  errors, setErrors
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    onSubmit({ title: title.trim(), description: description.trim() || null, due_date: dueDate || null, priority, category })
  }

  const categories = [
    { value: 'daily', label: 'Daily' },
    { value: 'dsa',   label: 'DSA' },
    { value: 'general', label: 'General' },
  ]
  const priorities = [
    { value: 'low',    label: 'Low',    color: 'border-green-500/30  text-green-400  bg-green-500/10' },
    { value: 'medium', label: 'Medium', color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' },
    { value: 'high',   label: 'High',   color: 'border-red-500/30    text-red-400    bg-red-500/10' },
  ]

  return (
    <div className={isOpen ? 'block' : 'hidden'}>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className="relative w-full max-w-md bg-surface-900 border-l border-surface-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-800 mb-6">
            <h2 className="text-xl font-bold text-surface-50">{task ? 'Edit Task' : 'Create Task'}</h2>
            <button type="button" onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors p-1.5 hover:bg-surface-800 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <Input
                label="Title" value={title} required
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: null })) }}
                placeholder="e.g. Solve 3 LeetCode problems"
                error={errors.title}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-surface-200">
                  Description <span className="text-xs text-surface-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about this task..."
                  className="w-full bg-surface-800 border border-surface-600 rounded-xl text-surface-100 placeholder-surface-500 py-2.5 px-3.5 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                />
              </div>
              <Input type="date" label="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onClick={(e) => e.target.showPicker?.()} />

              {/* Category pills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-surface-200">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <motion.button
                      key={c.value} type="button" whileTap={{ scale: 0.94 }}
                      onClick={() => setCategory(c.value)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all ${
                        category === c.value
                          ? 'border-brand-500 text-brand-400 bg-brand-500/10 shadow-brand-sm'
                          : 'border-surface-600 text-surface-300 hover:bg-surface-800'
                      }`}
                    >{c.label}</motion.button>
                  ))}
                </div>
              </div>

              {/* Priority pills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-surface-200">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => (
                    <motion.button
                      key={p.value} type="button" whileTap={{ scale: 0.94 }}
                      onClick={() => setPriority(p.value)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all ${
                        priority === p.value
                          ? `${p.color} border-current shadow-sm`
                          : 'border-surface-600 text-surface-300 hover:bg-surface-800'
                      }`}
                    >{p.label}</motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-6 border-t border-surface-800 mt-6 bg-surface-900 sticky bottom-0">
              <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={onCancel} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1 rounded-xl" loading={loading}>
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
