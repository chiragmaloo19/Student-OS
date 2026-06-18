import { classNames } from '../../utils/helpers'
import Spinner from './Spinner'

/** Button — reusable button with variant, size, and loading state support */
const variantStyles = {
  primary:   'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-brand hover:shadow-brand-lg focus-ring disabled:opacity-50',
  secondary: 'bg-surface-800 hover:bg-surface-700 active:bg-surface-600 text-surface-100 border border-surface-600 hover:border-surface-500 focus-ring disabled:opacity-50',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus-ring disabled:opacity-50',
  ghost:     'bg-transparent hover:bg-surface-800 text-surface-300 hover:text-surface-100 focus-ring disabled:opacity-50',
  outline:   'bg-transparent border border-brand-500 text-brand-400 hover:bg-brand-500/10 focus-ring disabled:opacity-50',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

/**
 * Button component with variant, size, loading, and icon support
 * @param {object} props
 */
export function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon     = null,
  iconRight = null,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center font-lato font-semibold transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} color="current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
}

export default Button
