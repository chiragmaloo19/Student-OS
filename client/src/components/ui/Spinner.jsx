import { classNames } from '../../utils/helpers'

/**
 * Spinner — animated loading indicator
 * @param {{ size?: 'sm'|'md'|'lg', color?: string, className?: string }} props
 */
export function Spinner({ size = 'md', color = 'brand', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
  }

  const colorMap = {
    brand:   'border-brand-500/30 border-t-brand-500',
    white:   'border-white/30 border-t-white',
    current: 'border-current/30 border-t-current',
    gray:    'border-surface-600 border-t-surface-300',
  }

  return (
    <span
      role="status"
      aria-label="Loading"
      className={classNames(
        'inline-block rounded-full animate-spin',
        sizeMap[size],
        colorMap[color] ?? colorMap.brand,
        className
      )}
    />
  )
}

export default Spinner
