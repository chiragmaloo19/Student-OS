import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button, PageLayout } from '../../components/ui'
import PlacementPipeline from '../../components/placements/PlacementPipeline'
import PlacementTable from '../../components/placements/PlacementTable'
import PlacementForm from '../../components/placements/PlacementForm'
import PlacementNotesPanel from '../../components/placements/PlacementNotesPanel'

/* ── Shimmer table skeleton ─────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="w-full bg-surface-900 border border-surface-800/80 rounded-2xl overflow-hidden shadow-xl">
      <div className="h-12 animate-shimmer border-b border-surface-800" />
      <div className="divide-y divide-surface-800/60 px-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-4 gap-4">
            <div className="space-y-2 w-1/4">
              <div className="h-4 rounded animate-shimmer w-3/4" />
              <div className="h-3 rounded animate-shimmer w-1/2" />
            </div>
            <div className="h-6 rounded-full animate-shimmer w-20" />
            <div className="h-4 rounded animate-shimmer w-24" />
            <div className="h-4 rounded animate-shimmer w-16" />
            <div className="h-8 rounded animate-shimmer w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Theme-aware confetti particle ──────────────────────────── */
/* Uses brand greens + surface blues — no rainbow colours */
const CONFETTI_COLORS = [
  '#00d462', '#2bef83', '#70ffb0',   // brand greens
  '#008040', '#006634',               // darker greens
  '#334155', '#475569', '#64748b',    // surface blues
]
const N_PARTICLES = 28

function ConfettiParticle({ color, startX, delay }) {
  const angle  = Math.random() * 60 - 30          // -30..+30 deg horizontal spread
  const endX   = startX + Math.sin((angle * Math.PI) / 180) * (120 + Math.random() * 80)
  const endY   = 160 + Math.random() * 80
  const rotate = Math.random() > 0.5 ? 360 : -360
  const size   = 6 + Math.random() * 6
  const shape  = Math.random() > 0.5 ? '50%' : '2px'

  return (
    <motion.div
      style={{ position: 'absolute', top: 0, left: startX, width: size, height: size,
               borderRadius: shape, backgroundColor: color, willChange: 'transform,opacity' }}
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{ opacity: 0, x: endX - startX, y: endY, rotate, scale: 0.4 }}
      transition={{ duration: 1.6 + Math.random() * 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

function OfferCelebration({ show }) {
  const particles = Array.from({ length: N_PARTICLES }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    startX: 20 + Math.random() * 260,
    delay: Math.random() * 0.35,
  }))

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="offer-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-[9998] flex items-center justify-center"
        >
          {/* Centered banner */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative bg-surface-900/95 border border-brand-500/40 rounded-2xl px-8 py-5 shadow-brand-xl backdrop-blur-md text-center"
          >
            <p className="text-2xl font-bold text-brand-400">🎉 Offer Received!</p>
            <p className="text-sm text-surface-400 mt-1">Congratulations on your offer!</p>

            {/* Confetti burst from the banner */}
            <div className="absolute top-0 left-0 right-0 overflow-visible pointer-events-none">
              {particles.map((p) => (
                <ConfettiParticle key={p.id} color={p.color} startX={p.startX} delay={p.delay} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function Placements() {
  const { user }      = useAuth()
  const { showToast } = useToast()

  const [placements,                 setPlacements]                 = useState([])
  const [loading,                    setLoading]                    = useState(true)
  const [isFormOpen,                 setIsFormOpen]                 = useState(false)
  const [editingPlacement,           setEditingPlacement]           = useState(null)
  const [formLoading,                setFormLoading]                = useState(false)
  const [selectedPlacementForNotes,  setSelectedPlacementForNotes]  = useState(null)
  const [isNotesOpen,                setIsNotesOpen]                = useState(false)

  /* Form State */
  const getLocalTodayDate = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const [formCompanyName,    setFormCompanyName]    = useState('')
  const [formRoleTitle,      setFormRoleTitle]      = useState('')
  const [formStatus,         setFormStatus]         = useState('applied')
  const [formAppliedDate,    setFormAppliedDate]    = useState(getLocalTodayDate())
  const [formSalaryOffered,  setFormSalaryOffered]  = useState('')
  const [formNotes,          setFormNotes]          = useState('')
  const [formErrors,         setFormErrors]         = useState({})

  const handleOpenAdd = () => {
    if (editingPlacement !== null) {
      setFormCompanyName('')
      setFormRoleTitle('')
      setFormStatus('applied')
      setFormAppliedDate(getLocalTodayDate())
      setFormSalaryOffered('')
      setFormNotes('')
      setFormErrors({})
      setEditingPlacement(null)
    }
    setIsFormOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingPlacement(p)
    setFormCompanyName(p.company_name || '')
    setFormRoleTitle(p.role_title || '')
    setFormStatus(p.status || 'applied')
    setFormAppliedDate(p.applied_date || getLocalTodayDate())
    setFormSalaryOffered(p.salary_offered !== null && p.salary_offered !== undefined ? p.salary_offered.toString() : '')
    setFormNotes(p.notes || '')
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleFormCancel = () => {
    setFormCompanyName('')
    setFormRoleTitle('')
    setFormStatus('applied')
    setFormAppliedDate(getLocalTodayDate())
    setFormSalaryOffered('')
    setFormNotes('')
    setFormErrors({})
    setEditingPlacement(null)
    setIsFormOpen(false)
  }

  /* Offer celebration — only triggered by status change, not on load */
  const [showOfferCelebration, setShowOfferCelebration] = useState(false)

  /* ── fetch ─────────────────────────────────────────────────── */
  const fetchPlacements = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('placements').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setPlacements(data || [])
    } catch (err) {
      console.error('Error fetching placements:', err)
      showToast('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchPlacements() }, [fetchPlacements])

  /* ── trigger offer celebration ─────────────────────────────── */
  const triggerOfferCelebration = () => {
    setShowOfferCelebration(true)
    setTimeout(() => setShowOfferCelebration(false), 2800)
  }

  /* ── add / edit ─────────────────────────────────────────────── */
  const handleFormSubmit = async (formData) => {
    if (!user) return
    try {
      setFormLoading(true)
      if (editingPlacement) {
        const { data, error } = await supabase
          .from('placements').update(formData).eq('id', editingPlacement.id).select()
        if (error) throw error
        setPlacements(prev => prev.map(p => p.id === editingPlacement.id ? data[0] : p))
        /* celebrate only if status changed TO offer */
        if (formData.status === 'offer' && editingPlacement.status !== 'offer') {
          triggerOfferCelebration()
        }
        showToast('Application updated successfully', 'success')
      } else {
        const { data, error } = await supabase
          .from('placements').insert({ ...formData, user_id: user.id }).select()
        if (error) throw error
        setPlacements(prev => [data[0], ...prev])
        if (formData.status === 'offer') triggerOfferCelebration()
        showToast('Application added successfully', 'success')
      }
      setFormCompanyName('')
      setFormRoleTitle('')
      setFormStatus('applied')
      setFormAppliedDate(getLocalTodayDate())
      setFormSalaryOffered('')
      setFormNotes('')
      setFormErrors({})
      setIsFormOpen(false)
      setEditingPlacement(null)
    } catch (err) {
      console.error('Error saving application:', err)
      showToast(err.message || 'Failed to save application', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  /* ── quick status change (optimistic) ───────────────────────── */
  const handleStatusChange = async (placement, newStatus) => {
    const original = [...placements]
    setPlacements(prev => prev.map(p => p.id === placement.id ? { ...p, status: newStatus } : p))

    /* celebrate offer from user action only */
    if (newStatus === 'offer' && placement.status !== 'offer') {
      triggerOfferCelebration()
    }

    try {
      const { error } = await supabase
        .from('placements').update({ status: newStatus }).eq('id', placement.id)
      if (error) throw error
      showToast(`Status updated to ${newStatus.toUpperCase()}`, 'success')
    } catch (err) {
      console.error('Error updating status:', err)
      setPlacements(original)
      showToast('Failed to change status. Reverting.', 'error')
    }
  }

  /* ── delete ─────────────────────────────────────────────────── */
  const handleDeletePlacement = async (id) => {
    try {
      const { error } = await supabase.from('placements').delete().eq('id', id)
      if (error) throw error
      setPlacements(prev => prev.filter(p => p.id !== id))
      showToast('Application deleted successfully', 'success')
    } catch (err) {
      console.error('Error deleting application:', err)
      showToast('Failed to delete application', 'error')
    }
  }

  return (
    <>
      {/* Offer celebration overlay — sits outside layout flow */}
      <OfferCelebration show={showOfferCelebration} />

      <PageLayout title="Placement Application Tracker">
        <div className="flex flex-col gap-6">

          {/* Header CTA */}
          <div className="flex items-center justify-between">
            <p className="text-surface-400 text-sm hidden md:block">
              Track your job applications, stages, and notes in one unified pipeline.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAdd}
              className="rounded-xl ml-auto"
            >
              Add Application
            </Button>
          </div>

          {/* Pipeline */}
          <PlacementPipeline placements={placements} />

          {/* Table section */}
          <div>
            <h3 className="text-base font-bold text-surface-200 mb-4 uppercase tracking-wider">
              All Applications
            </h3>

            {loading ? (
              <TableSkeleton />
            ) : placements.length > 0 ? (
              <PlacementTable
                placements={placements}
                onEdit={handleOpenEdit}
                onViewNotes={(p) => { setSelectedPlacementForNotes(p); setIsNotesOpen(true) }}
                onDelete={handleDeletePlacement}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.3 }}
                className="glass p-12 rounded-3xl text-center flex flex-col items-center border border-surface-800/60 max-w-lg mx-auto w-full mt-4"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center text-surface-400 mb-4 border border-surface-700/50"
                >
                  <Plus className="w-8 h-8" />
                </motion.div>
                <h3 className="text-lg font-bold text-surface-100 mb-1">No applications tracked</h3>
                <p className="text-sm text-surface-400 mb-6 max-w-xs">
                  You haven't added any placement applications yet. Click below to start tracking your job hunt!
                </p>
                <Button
                  variant="primary"
                  onClick={handleOpenAdd}
                  className="rounded-xl"
                >
                  Add First Application
                </Button>
              </motion.div>
            )}
          </div>

          {/* Drawers */}
          <PlacementForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onCancel={handleFormCancel}
            onSubmit={handleFormSubmit}
            placement={editingPlacement}
            loading={formLoading}
            companyName={formCompanyName} setCompanyName={setFormCompanyName}
            roleTitle={formRoleTitle} setRoleTitle={setFormRoleTitle}
            status={formStatus} setStatus={setFormStatus}
            appliedDate={formAppliedDate} setAppliedDate={setFormAppliedDate}
            salaryOffered={formSalaryOffered} setSalaryOffered={setFormSalaryOffered}
            notes={formNotes} setNotes={setFormNotes}
            errors={formErrors} setErrors={setFormErrors}
          />
          <PlacementNotesPanel
            isOpen={isNotesOpen}
            onClose={() => { setIsNotesOpen(false); setSelectedPlacementForNotes(null) }}
            placement={selectedPlacementForNotes}
          />
        </div>
      </PageLayout>
    </>
  )
}
