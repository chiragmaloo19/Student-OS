import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '../ui'

const statusMap = {
  applied: { label: 'Applied', color: 'blue', dotClass: 'bg-blue-400' },
  oa: { label: 'OA', color: 'yellow', dotClass: 'bg-yellow-400' },
  interview: { label: 'Interview', color: 'purple', dotClass: 'bg-purple-400' },
  offer: { label: 'Offer', color: 'green', dotClass: 'bg-green-400' },
  rejected: { label: 'Rejected', color: 'red', dotClass: 'bg-red-400' },
}

export default function StatusBadge({ status, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = statusMap[status] || { label: status, color: 'gray', dotClass: 'bg-surface-400' }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <Badge text={current.label} color={current.color} dot size="sm" />
        <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-36 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl z-30 py-1 overflow-hidden animate-scale-in">
          {Object.entries(statusMap).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key !== status) {
                  onStatusChange(key)
                }
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-700 transition-colors flex items-center gap-2 ${
                key === status ? 'text-brand-400 bg-surface-900/50' : 'text-surface-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${value.dotClass}`} />
              {value.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
