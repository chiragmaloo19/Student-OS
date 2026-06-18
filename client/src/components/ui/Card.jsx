import { classNames } from '../../utils/helpers'

/**
 * Card — glass-style surface container with optional hover effect
 * @param {object} props
 */
export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  glass = false,
  onClick,
}) {
  const paddingMap = {
    none: '',
    sm:   'p-3',
    md:   'p-5',
    lg:   'p-7',
  }

  return (
    <div
      onClick={onClick}
      className={classNames(
        'rounded-2xl border transition-all duration-200',
        glass
          ? 'bg-white/5 border-white/10 backdrop-blur-md'
          : 'bg-surface-900 border-surface-700/60',
        hover && 'hover:border-brand-500/50 hover:shadow-brand cursor-pointer hover:-translate-y-0.5',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

/** Card.Header — optional section for card titles */
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={classNames('mb-4 pb-4 border-b border-surface-700/60', className)}>
      {children}
    </div>
  )
}

/** Card.Footer — optional footer section */
Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={classNames('mt-4 pt-4 border-t border-surface-700/60', className)}>
      {children}
    </div>
  )
}

export default Card
