/**
 * formatDate — formats a date value into a human-readable string
 * @param {Date|string} date - date to format
 * @param {string} [locale='en-IN'] - locale string
 * @returns {string}
 */
export function formatDate(date, locale = 'en-IN') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/**
 * formatDateTime — formats a date-time value with time included
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * capitalize — capitalizes the first letter of a string
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * classNames — joins class strings conditionally (lightweight clsx)
 * @param {...string} classes
 * @returns {string}
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * truncate — truncates a string to a max length with ellipsis
 * @param {string} str
 * @param {number} [maxLen=80]
 * @returns {string}
 */
export function truncate(str, maxLen = 80) {
  if (!str || str.length <= maxLen) return str
  return str.slice(0, maxLen).trimEnd() + '…'
}
