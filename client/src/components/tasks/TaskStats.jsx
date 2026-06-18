import { Calendar, CheckSquare } from 'lucide-react'

export default function TaskStats({ tasks = [] }) {
  // Get local today date string (YYYY-MM-DD)
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const localTodayDate = `${year}-${month}-${day}`

  // Tasks due today
  const dueTodayCount = tasks.filter(t => t.due_date === localTodayDate).length

  // Total completed tasks
  const completedCount = tasks.filter(t => t.is_completed).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Due Today Card */}
      <div className="glass p-5 rounded-2xl flex items-center gap-4 hover:border-brand-500/20 transition-all duration-300">
        <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-surface-400 font-semibold uppercase tracking-wider">Due Today</p>
          <p className="text-3xl font-bold text-surface-50 mt-1">{dueTodayCount}</p>
        </div>
      </div>

      {/* Total Completed Card */}
      <div className="glass p-5 rounded-2xl flex items-center gap-4 hover:border-brand-500/20 transition-all duration-300">
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-surface-400 font-semibold uppercase tracking-wider">Total Completed</p>
          <p className="text-3xl font-bold text-surface-50 mt-1">{completedCount}</p>
        </div>
      </div>
    </div>
  )
}
