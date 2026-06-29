export default function PlacementPipeline({ placements = [] }) {
  const counts = {
    applied: 0,
    oa: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  }

  placements.forEach((p) => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++
    }
  })

  const stages = [
    { key: 'applied', label: 'Applied', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
    { key: 'oa', label: 'OA', color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' },
    { key: 'interview', label: 'Interview', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
    { key: 'offer', label: 'Offer', color: 'border-green-500/20 text-green-400 bg-green-500/5' },
    { key: 'rejected', label: 'Rejected', color: 'border-red-500/20 text-red-400 bg-red-500/5' },
  ]

  // Stats calculation
  const totalApplied = placements.length
  const inProgress = counts.oa + counts.interview
  const offersReceived = counts.offer

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* Top summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl hover:border-brand-500/20 transition-all duration-300">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Applications</p>
          <p className="text-2xl font-bold text-surface-50 mt-1">{totalApplied}</p>
        </div>
        <div className="glass p-4 rounded-2xl hover:border-brand-500/20 transition-all duration-300">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">In Progress (OA + Interview)</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{inProgress}</p>
        </div>
        <div className="glass p-4 rounded-2xl hover:border-brand-500/20 transition-all duration-300">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Offers Received</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{offersReceived}</p>
        </div>
      </div>

      {/* Pipeline board row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stage) => (
          <div
            key={stage.key}
            className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:scale-[1.02] ${stage.color}`}
          >
            <span className="text-xs font-semibold uppercase opacity-80">{stage.label}</span>
            <span className="text-2xl font-bold">{counts[stage.key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
