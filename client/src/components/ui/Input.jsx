import { forwardRef } from 'react'
import { classNames } from '../../utils/helpers'

/**
 * Input — styled form input with label, error, and icon support
 * @param {object} props
 */
export const Input = forwardRef(function Input(
  {
    label,
    placeholder,
    type = 'text',
    error,
    hint,
    icon,
    iconRight,
    className = '',
    id,
    required,
    disabled,
    ...rest
  },
  ref
) {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-surface-200"
        >
          {label}
          {required && <span className="text-brand-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={classNames(
            'w-full bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500',
            'py-2.5 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            icon ? 'pl-10' : 'pl-3.5',
            iconRight ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-surface-600 hover:border-surface-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...rest}
        />

        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-surface-500">{hint}</p>
      )}
    </div>
  )
})

export default Input
