import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Trash2, FileText, Calendar, IndianRupee } from 'lucide-react'
import StatusBadge from './StatusBadge'

const rowVariants = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.045, duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.18 } },
}

export default function PlacementTable({ placements = [], onEdit, onViewNotes, onDelete, onStatusChange }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }
  const formatSalary = (salary) => {
    if (!salary) return '-'
    return '₹' + Number(salary).toLocaleString('en-IN')
  }

  return (
    <>
      {/* ── Desktop table (hidden on mobile) ──────────────── */}
      <div className="hidden sm:block w-full bg-surface-900 border border-surface-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-800 bg-surface-950/45 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                <th className="py-4 px-5">Company &amp; Role</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Applied Date</th>
                <th className="py-4 px-5">Salary Offered</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60 text-sm">
              <AnimatePresence initial={false}>
                {placements.map((p, i) => {
                  const isConfirming = confirmDeleteId === p.id
                  return (
                    <motion.tr
                      key={p.id}
                      custom={i}
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="hover:bg-surface-800/30 transition-colors"
                    >
                      {/* Company & Role */}
                      <td className="py-4 px-5">
                        <p className="font-bold text-surface-50">{p.company_name}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{p.role_title}</p>
                      </td>

                      {/* Status badge with quick-change dropdown */}
                      <td className="py-4 px-5">
                        <StatusBadge status={p.status} onStatusChange={(newStatus) => onStatusChange(p, newStatus)} />
                      </td>

                      {/* Applied date */}
                      <td className="py-4 px-5 text-surface-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-surface-400" />
                          {formatDate(p.applied_date)}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-semibold text-surface-200">
                        {p.status === 'offer' ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {formatSalary(p.salary_offered)}
                          </span>
                        ) : (
                          <span className="text-surface-500 font-normal">N/A</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <AnimatePresence mode="wait">
                            {isConfirming ? (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.88 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-1 bg-surface-800 p-0.5 rounded-lg border border-surface-700"
                              >
                                <span className="text-xs font-semibold text-surface-300 px-2">Delete?</span>
                                <button
                                  onClick={() => { onDelete(p.id); setConfirmDeleteId(null) }}
                                  className="text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-md transition-all"
                                >Yes</button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-xs font-semibold hover:bg-surface-700 text-surface-400 hover:text-surface-200 px-2 py-1 rounded-md transition-all"
                                >No</button>
                              </motion.div>
                            ) : (
                              <motion.div key="actions" className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {p.notes && (
                                  <button
                                    onClick={() => onViewNotes(p)}
                                    className="p-1.5 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                                    title="View notes"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onEdit(p)}
                                  className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-all"
                                  title="Edit application"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(p.id)}
                                  className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Delete application"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list (shown only on mobile, hidden sm+) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        <AnimatePresence initial={false}>
          {placements.map((p, i) => {
            const isConfirming = confirmDeleteId === p.id
            return (
              <motion.div
                key={p.id}
                custom={i}
                variants={rowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-surface-900 border border-surface-800/80 rounded-2xl p-4 flex flex-col gap-3"
              >
                {/* Company + Role + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-surface-50 truncate">{p.company_name}</p>
                    <p className="text-xs text-surface-400 mt-0.5 truncate">{p.role_title}</p>
                  </div>
                  <StatusBadge status={p.status} onStatusChange={(newStatus) => onStatusChange(p, newStatus)} />
                </div>

                {/* Date + Salary */}
                <div className="flex items-center gap-4 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(p.applied_date)}
                  </span>
                  {p.status === 'offer' && (
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <IndianRupee className="w-3 h-3" />
                      {formatSalary(p.salary_offered)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-surface-800/60">
                  {isConfirming ? (
                    <div className="flex items-center gap-1 bg-surface-800 p-0.5 rounded-lg border border-surface-700 ml-auto">
                      <span className="text-xs font-semibold text-surface-300 px-2">Delete?</span>
                      <button
                        onClick={() => { onDelete(p.id); setConfirmDeleteId(null) }}
                        className="text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-md transition-all"
                      >Yes</button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-semibold hover:bg-surface-700 text-surface-400 hover:text-surface-200 px-2 py-1 rounded-md transition-all"
                      >No</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      {p.notes && (
                        <button
                          onClick={() => onViewNotes(p)}
                          className="p-2 text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                          title="View notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(p)}
                        className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="p-2 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}
