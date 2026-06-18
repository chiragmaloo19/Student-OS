import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui'

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.20 } },
}
const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit:    { x: '100%', transition: { duration: 0.22, ease: 'easeIn' } },
}

export default function PlacementNotesPanel({ isOpen, onClose, placement }) {
  return (
    <AnimatePresence>
      {isOpen && placement && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="initial" animate="animate" exit="exit"
            className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="initial" animate="animate" exit="exit"
            className="relative w-full max-w-md bg-surface-900 border-l border-surface-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-800 mb-6">
              <div>
                <h2 className="text-xl font-bold text-surface-50">Application Notes</h2>
                <p className="text-xs text-surface-400 mt-1">
                  {placement.company_name} — {placement.role_title}
                </p>
              </div>
              <button onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors p-1.5 hover:bg-surface-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <div className="bg-surface-950/50 rounded-2xl p-5 border border-surface-800/60 min-h-[300px] text-sm text-surface-200 whitespace-pre-wrap break-words leading-relaxed">
                {placement.notes
                  ? placement.notes
                  : <span className="text-surface-500 italic">No notes provided for this application.</span>
                }
              </div>
            </div>

            <div className="pt-6 border-t border-surface-800 mt-6 bg-surface-900 sticky bottom-0">
              <Button variant="secondary" className="w-full rounded-xl" onClick={onClose}>
                Close Notes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
