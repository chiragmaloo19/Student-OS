import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />,
  error:   <XCircle    className="w-5 h-5 text-red-400  shrink-0" />,
  info:    <Info       className="w-5 h-5 text-blue-400 shrink-0" />,
}

const borderMap = {
  success: 'border-brand-500/40 bg-surface-900/95',
  error:   'border-red-500/40   bg-surface-900/95',
  info:    'border-blue-500/40  bg-surface-900/95',
}

const toastVariants = {
  initial: { opacity: 0, x: 80, scale: 0.94 },
  animate: { opacity: 1, x: 0,  scale: 1,   transition: { type: 'spring', stiffness: 340, damping: 26 } },
  exit:    { opacity: 0, x: 60, scale: 0.94, transition: { duration: 0.22, ease: 'easeIn' } },
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    /* z-[9999] ensures toasts always sit above headers, sidebars, modals */
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="alert"
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md pointer-events-auto shadow-2xl ${borderMap[toast.type] ?? borderMap.info}`}
          >
            <div className="flex gap-3 items-center">
              {iconMap[toast.type] ?? iconMap.info}
              <span className="text-sm font-semibold text-surface-100 leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-surface-400 hover:text-surface-200 transition-colors ml-4 shrink-0 p-0.5 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
