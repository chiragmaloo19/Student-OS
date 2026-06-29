import { useEffect, useRef, useState } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import { PageLayout } from '../../components/ui/PageLayout'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'
import PlannerForm from '../../components/ai/PlannerForm'
import PlanDisplay from '../../components/ai/PlanDisplay'
import PreviousPlans from '../../components/ai/PreviousPlans'

/** Cycling messages shown while Groq is generating the plan */
const LOADING_MESSAGES = [
  'Analysing your weak topics...',
  'Building your schedule...',
  'Calculating daily targets...',
  'Almost ready...',
]

/** AIPlanner — orchestrator for the AI Study Planner module */
export default function AIPlanner() {
  const { showToast } = useToast()

  const [loading,           setLoading]           = useState(false)
  const [generatedPlan,     setGeneratedPlan]     = useState(null)
  const [previousPlans,     setPreviousPlans]     = useState([])
  const [plansLoading,      setPlansLoading]      = useState(true)
  const [loadingMessage,    setLoadingMessage]    = useState(LOADING_MESSAGES[0])
  const [lastInputs,        setLastInputs]        = useState(null)

  const cycleRef = useRef(null)

  /** Fetch previous plans on mount */
  useEffect(() => {
    fetchPreviousPlans()
  }, [])

  /** Load last 5 saved plans for the user */
  const fetchPreviousPlans = async () => {
    try {
      setPlansLoading(true)
      const res = await api.get('/api/ai/my-plans')
      if (res.data.success) {
        setPreviousPlans(res.data.data.plans)
      }
    } catch (err) {
      console.error('Failed to load previous plans:', err)
    } finally {
      setPlansLoading(false)
    }
  }

  /** Start cycling loading messages with setInterval every 3 seconds */
  const startCycling = () => {
    let idx = 0
    setLoadingMessage(LOADING_MESSAGES[0])
    cycleRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[idx])
    }, 3000)
  }

  /** Stop the cycling interval */
  const stopCycling = () => {
    if (cycleRef.current) {
      clearInterval(cycleRef.current)
      cycleRef.current = null
    }
  }

  /** Submit form to generate a new plan via API */
  const handleGenerate = async (inputs) => {
    setLastInputs(inputs)
    setLoading(true)
    startCycling()
    setGeneratedPlan(null)

    try {
      const res = await api.post('/api/ai/generate-plan', inputs)
      if (res.data.success) {
        setGeneratedPlan(res.data.data.plan)
        // Prepend saved record to previous plans list
        if (res.data.data.savedRecord) {
          setPreviousPlans(prev => [res.data.data.savedRecord, ...prev].slice(0, 5))
        }
        showToast('Plan generated successfully!', 'success')
      } else {
        showToast(res.data.message || 'Failed to generate plan', 'error')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not generate plan right now'
      showToast(msg, 'error')
    } finally {
      stopCycling()
      setLoading(false)
    }
  }

  /** Re-submit the same inputs for a fresh plan */
  const handleRegenerate = () => {
    if (lastInputs) handleGenerate(lastInputs)
  }

  /** Delete a saved plan by id (optimistic update) */
  const handleDeletePlan = async (id) => {
    // Optimistic: remove from list immediately
    setPreviousPlans(prev => prev.filter(p => p.id !== id))
    try {
      await api.delete(`/api/ai/plans/${id}`)
      showToast('Plan deleted', 'success')
    } catch (err) {
      // Rollback by re-fetching
      showToast('Failed to delete plan', 'error')
      fetchPreviousPlans()
    }
  }

  return (
    <PageLayout title="">
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
            <Brain size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-surface-50">AI Study Planner</h1>
            <p className="text-surface-400 text-sm mt-0.5">Personalized weekly schedules powered by AI</p>
          </div>
        </div>

        {/* Input form card */}
        <Card padding="lg">
          <Card.Header>
            <h2 className="font-bold text-surface-100 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400" />
              Configure Your Study Plan
            </h2>
          </Card.Header>
          <PlannerForm onSubmit={handleGenerate} loading={loading} />
        </Card>

        {/* Loading state with cycling messages */}
        {loading && (
          <Card padding="lg" glass>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
              <p className="text-brand-300 font-semibold text-sm text-center transition-all duration-500">
                {loadingMessage}
              </p>
              {/* Pulsing progress bar */}
              <div className="w-64 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-surface-500 text-xs">This may take up to 30 seconds…</p>
            </div>
          </Card>
        )}

        {/* Generated plan display */}
        {generatedPlan && !loading && (
          <Card padding="lg">
            <Card.Header>
              <h2 className="font-bold text-surface-100 flex items-center gap-2">
                <Brain size={16} className="text-brand-400" />
                Your Study Plan
              </h2>
            </Card.Header>
            <PlanDisplay
              planText={generatedPlan}
              onRegenerate={handleRegenerate}
              generatedAt="just now"
            />
          </Card>
        )}

        {/* Previous plans section */}
        {!plansLoading && previousPlans.length > 0 && (
          <Card padding="lg">
            <Card.Header>
              <h2 className="font-bold text-surface-100">Plan History</h2>
            </Card.Header>
            <PreviousPlans plans={previousPlans} onDelete={handleDeletePlan} />
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
