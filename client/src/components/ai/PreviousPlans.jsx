/** PreviousPlans — accordion list of last 5 saved AI plans with delete support */
import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Brain, Trash2 } from 'lucide-react'
import PlanDisplay from './PlanDisplay'

/** Format an ISO date string as a relative time label */
function relativeTime(isoStr) {
  if (!isoStr) return 'Unknown'
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/** Single accordion card for one previous plan */
function PlanCard({ plan, isOpen, onToggle, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  const handleDeleteClick = (e) => {
    e.stopPropagation() // Don't toggle the accordion
    setConfirming(true)
  }
  const handleConfirmDelete = (e) => {
    e.stopPropagation()
    onDelete(plan.id)
  }
  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <div className="bg-surface-900 border border-surface-700/60 rounded-2xl overflow-hidden transition-all duration-200 hover:border-surface-600">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-surface-400 text-xs">
            <Clock size={12} />
            <span>{relativeTime(plan.generated_at)}</span>
            <span className="text-surface-600">•</span>
            <span>{plan.hours_per_week} hrs/wk</span>
          </div>
          {/* Topic pills summary — detect Mode A (goals) vs Mode B (topics) */}
          <div className="flex flex-wrap gap-1 mt-1">
            {(plan.weak_topics || []).length > 0 && (plan.weak_topics[0] || '').startsWith('goals: ') ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Custom goals
              </span>
            ) : (
              <>
                {(plan.weak_topics || []).slice(0, 6).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {t}
                  </span>
                ))}
                {(plan.weak_topics || []).length > 6 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700 text-surface-400">
                    +{plan.weak_topics.length - 6} more
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side: delete button + chevron */}
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {confirming ? (
            <div className="flex items-center gap-1 bg-red-500/5 border border-red-500/20 rounded-xl px-2 py-1">
              <span className="text-[10px] font-bold text-red-400 px-1">Sure?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="text-[10px] font-bold bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-lg transition-all"
              >Yes</button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="text-[10px] font-semibold hover:bg-surface-700 text-surface-400 hover:text-surface-200 px-2 py-1 rounded-lg transition-all"
              >No</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete plan"
            >
              <Trash2 size={14} />
            </button>
          )}
          <span className="text-surface-500">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Expanded plan content */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-surface-800/60">
          <div className="pt-4">
            <PlanDisplay
              planText={plan.plan_content}
              onRegenerate={null}
              generatedAt={relativeTime(plan.generated_at)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/** PreviousPlans — renders accordion list; only one card open at a time */
export default function PreviousPlans({ plans, onDelete }) {
  const [openId, setOpenId] = useState(null)

  if (!plans || plans.length === 0) return null

  /** Toggle open/close a plan card */
  const toggle = (id) => setOpenId(prev => (prev === id ? null : id))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={16} className="text-brand-400" />
        <h3 className="text-sm font-bold text-surface-200">Previous Plans</h3>
        <span className="text-xs text-surface-500">({plans.length})</span>
      </div>
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isOpen={openId === plan.id}
          onToggle={() => toggle(plan.id)}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
