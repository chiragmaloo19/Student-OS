import { motion } from 'framer-motion'
import { classNames } from '../../utils/helpers'

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * PageLayout — max-width centered wrapper with page-enter transition
 * @param {{ children: React.ReactNode, className?: string, narrow?: boolean, title?: string }} props
 */
export function PageLayout({ children, className = '', narrow = false, title }) {
  return (
    <div className="min-h-screen bg-surface-950">
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className={classNames(
          'mx-auto px-4 sm:px-6 lg:px-8 py-8',
          narrow ? 'max-w-3xl' : 'max-w-7xl',
          className
        )}
      >
        {title && (
          <h1 className="text-2xl font-bold text-surface-50 mb-6 gradient-text">{title}</h1>
        )}
        {children}
      </motion.main>
    </div>
  )
}

export default PageLayout
