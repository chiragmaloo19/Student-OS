import { Filter } from 'lucide-react'

export default function TaskFilters({
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
}) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'daily', label: 'Daily' },
    { value: 'dsa', label: 'DSA' },
    { value: 'general', label: 'General' },
  ]

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  return (
    <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex items-center gap-2 text-surface-300 w-full md:w-auto">
        <Filter className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-semibold">Filters</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:justify-end">
        {/* Category Selector */}
        <div className="flex flex-col gap-1 w-full sm:w-48">
          <label className="text-xs text-surface-400 font-semibold uppercase">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-800 border border-surface-600 rounded-xl text-surface-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selector */}
        <div className="flex flex-col gap-1 w-full sm:w-48">
          <label className="text-xs text-surface-400 font-semibold uppercase">Priority</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-surface-800 border border-surface-600 rounded-xl text-surface-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
