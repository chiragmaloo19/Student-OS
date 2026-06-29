import { NotebookPen } from 'lucide-react'

export default function Notes() {
  return (
    <div className="animate-fade-in flex items-center justify-center min-h-[60vh] px-4">
      <div className="glass border border-surface-800/60 rounded-3xl p-10 flex flex-col items-center text-center max-w-sm w-full shadow-xl">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-surface-800/60 border border-surface-700/40 flex items-center justify-center mb-6">
          <NotebookPen className="w-10 h-10 text-surface-500" />
        </div>

        {/* Coming Soon badge */}
        <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
          Coming Soon
        </span>

        {/* Heading */}
        <h1 className="text-xl font-black text-surface-100 mb-2">Notes</h1>

        {/* Subtext */}
        <p className="text-sm text-surface-400 leading-relaxed">
          This feature is coming soon. We're working on it and it will be available in the next update.
        </p>
      </div>
    </div>
  )
}
