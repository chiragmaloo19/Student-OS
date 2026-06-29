import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button, Input } from '../ui'

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.20 } },
}
const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit:    { x: '100%', transition: { duration: 0.22, ease: 'easeIn' } },
}

export default function PlacementForm({ 
  isOpen, onClose, onCancel, onSubmit, placement = null, loading = false,
  companyName, setCompanyName,
  roleTitle, setRoleTitle,
  status, setStatus,
  appliedDate, setAppliedDate,
  salaryOffered, setSalaryOffered,
  notes, setNotes,
  errors, setErrors
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!roleTitle.trim())   newErrors.roleTitle   = 'Role title is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    onSubmit({
      company_name:   companyName.trim(),
      role_title:     roleTitle.trim(),
      status,
      applied_date:   appliedDate,
      salary_offered: salaryOffered !== '' ? parseFloat(salaryOffered) : null,
      notes:          notes.trim() || null,
    })
  }

  const statuses = [
    { value: 'applied',   label: 'Applied'   },
    { value: 'oa',        label: 'OA'         },
    { value: 'interview', label: 'Interview'  },
    { value: 'offer',     label: 'Offer'      },
    { value: 'rejected',  label: 'Rejected'   },
  ]

  return (
    <div className={isOpen ? 'block' : 'hidden'}>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className="relative w-full max-w-md bg-surface-900 border-l border-surface-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-800 mb-6">
            <h2 className="text-xl font-bold text-surface-50">
              {placement ? 'Edit Application' : 'Add Application'}
            </h2>
            <button type="button" onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors p-1.5 hover:bg-surface-800 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <Input
                label="Company Name" value={companyName} required
                onChange={(e) => { setCompanyName(e.target.value); if (errors.companyName) setErrors(p => ({...p, companyName: null})) }}
                placeholder="e.g. Google"
                error={errors.companyName}
              />
              <Input
                label="Role Title" value={roleTitle} required
                onChange={(e) => { setRoleTitle(e.target.value); if (errors.roleTitle) setErrors(p => ({...p, roleTitle: null})) }}
                placeholder="e.g. Software Engineer Intern"
                error={errors.roleTitle}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-surface-200">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-600 rounded-xl text-surface-100 py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                >
                  {statuses.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                </select>
              </div>
              <Input type="date" label="Applied Date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} required />
              {status === 'offer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    type="number"
                    label="Salary Offered (₹)"
                    value={salaryOffered}
                    onChange={(e) => setSalaryOffered(e.target.value)}
                    placeholder="e.g. 1200000"
                    hint="Only visible when status is Offer"
                  />
                </motion.div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-surface-200">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Interview questions, contacts, deadlines..."
                  className="w-full bg-surface-800 border border-surface-600 rounded-xl text-surface-100 placeholder-surface-500 py-2.5 px-3.5 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-surface-800 mt-6 bg-surface-900 sticky bottom-0">
              <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={onCancel} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1 rounded-xl" loading={loading}>
                {placement ? 'Save Changes' : 'Add Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
