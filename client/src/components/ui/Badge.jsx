import { classNames } from '../../utils/helpers'

/** Badge — colored status pill for roles, statuses, tags */
const colorMap = {
  green:  'bg-green-500/15  text-green-400  border-green-500/30',
  red:    'bg-red-500/15    text-red-400    border-red-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  blue:   'bg-blue-500/15   text-blue-400   border-blue-500/30',
  gray:   'bg-surface-700   text-surface-300 border-surface-600',
  brand:  'bg-brand-500/15  text-brand-400  border-brand-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const sizeMap = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1',
}

/**
 * Badge component for status labels, tags, and role indicators
 * @param {{ color?: string, size?: string, text: string, dot?: boolean }} props
 */
export function Badge({ text, color = 'gray', size = 'md', dot = false, className = '' }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        colorMap[color] ?? colorMap.gray,
        sizeMap[size],
        className
      )}
    >
      {dot && (
        <span
          className={classNames(
            'w-1.5 h-1.5 rounded-full',
            color === 'green'  ? 'bg-green-400'  :
            color === 'red'    ? 'bg-red-400'    :
            color === 'yellow' ? 'bg-yellow-400' :
            color === 'blue'   ? 'bg-blue-400'   :
            color === 'brand'  ? 'bg-brand-400'  :
            color === 'purple' ? 'bg-purple-400' :
            'bg-surface-400'
          )}
        />
      )}
      {text}
    </span>
  )
}

export default Badge
