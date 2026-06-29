/** PlannerForm — Mode A (Describe Goals textarea) or Mode B (topic pills) */
import { useState } from 'react'
import { Sparkles, Clock, Calendar, Target, FileText } from 'lucide-react'
import { Button } from '../ui/Button'

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs',
  'DP', 'Sorting', 'Searching', 'Recursion',
  'OS', 'DBMS', 'CN', 'OOP', 'SQL', 'System Design',
]

const STAGES = [
  { id: 'not_started',        label: 'Just Starting',      sub: "Haven't begun yet" },
  { id: 'preparing',          label: 'Actively Preparing', sub: 'Studying daily' },
  { id: 'interviews_ongoing', label: 'Interviews Ongoing', sub: 'Already interviewing' },
]

/** PlannerForm renders the full input form for the AI study planner */
export default function PlannerForm({ onSubmit, loading }) {
  // Mode A = custom goals text; Mode B = topic pills
  const [mode, setMode] = useState('B')

  // Mode A state
  const [goalsText, setGoalsText]   = useState('')
  const [goalsError, setGoalsError] = useState('')

  // Mode B state
  const [selectedTopics, setSelectedTopics] = useState([])
  const [topicError, setTopicError]         = useState('')

  // Shared state
  const [hours, setHours]         = useState(10)
  const [targetDate, setTargetDate] = useState('')
  const [stage, setStage]         = useState('')
  const [dateError, setDateError] = useState('')

  /** Toggle a topic pill on/off */
  const toggleTopic = (topic) => {
    setTopicError('')
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  /** Validate date selection and show inline error for past dates */
  const handleDateChange = (e) => {
    const val = e.target.value
    setTargetDate(val)
    if (val && new Date(val) <= new Date()) {
      setDateError('Target date must be in the future')
    } else {
      setDateError('')
    }
  }

  /** Validate and submit the form */
  const handleSubmit = () => {
    if (mode === 'A') {
      if (!goalsText.trim()) {
        setGoalsError('Please describe your study goals')
        return
      }
      setGoalsError('')
    } else {
      if (selectedTopics.length === 0) {
        setTopicError('Please select at least one topic')
        return
      }
      setTopicError('')
    }
    if (!targetDate || dateError) return
    if (!stage) return

    const payload =
      mode === 'A'
        ? { goalsText: goalsText.trim(), hoursPerWeek: hours, targetDate, preparationStage: stage }
        : { weakTopics: selectedTopics, hoursPerWeek: hours, targetDate, preparationStage: stage }

    onSubmit(payload)
  }

  const canSubmit =
    (mode === 'A' ? goalsText.trim().length > 0 : selectedTopics.length > 0) &&
    targetDate && !dateError && stage && !loading

  // Compute tomorrow's date string for min attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Mode switcher ───────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-surface-200">How do you want to describe your focus?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('B')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
              mode === 'B'
                ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                : 'border-surface-700 bg-surface-800 text-surface-300 hover:border-surface-600'
            }`}
          >
            <Target size={15} className="shrink-0" />
            <div>
              <p className="text-xs font-bold">Select Topics</p>
              <p className="text-[10px] text-surface-500 mt-0.5">Pick from a list</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode('A')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
              mode === 'A'
                ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                : 'border-surface-700 bg-surface-800 text-surface-300 hover:border-surface-600'
            }`}
          >
            <FileText size={15} className="shrink-0" />
            <div>
              <p className="text-xs font-bold">Describe Goals</p>
              <p className="text-[10px] text-surface-500 mt-0.5">Free-form text</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Mode B: Topic pills ────────────────────────────── */}
      {mode === 'B' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-brand-400" />
            <p className="text-sm font-semibold text-surface-200">Select Weak Topics</p>
            <span className="ml-auto text-xs text-surface-500">{selectedTopics.length} selected</span>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {TOPICS.map(topic => {
              const active = selectedTopics.includes(topic)
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    active
                      ? 'bg-brand-500 border-brand-500 text-white shadow-brand'
                      : 'bg-surface-800 border-surface-700 text-surface-300 hover:border-brand-500/50 hover:text-surface-100'
                  }`}
                >
                  {topic}
                </button>
              )
            })}
          </div>
          {topicError && <p className="text-xs text-red-400 mt-2">{topicError}</p>}
        </div>
      )}

      {/* ── Mode A: Goals textarea ────────────────────────── */}
      {mode === 'A' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-brand-400" />
            <p className="text-sm font-semibold text-surface-200">Describe Your Goals</p>
            <span className="ml-auto text-xs text-surface-500">{goalsText.length} chars</span>
          </div>
          <textarea
            value={goalsText}
            onChange={(e) => {
              setGoalsText(e.target.value)
              if (goalsError) setGoalsError('')
            }}
            placeholder="e.g. I want to crack FAANG interviews. I'm good at arrays but weak at DP and graph algorithms. I also need to cover OS and DBMS for core companies."
            className={`w-full bg-surface-800 border rounded-xl px-4 py-3 text-surface-100 placeholder-surface-500 text-sm min-h-28 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors resize-none ${
              goalsError ? 'border-red-500' : 'border-surface-700 focus:border-brand-500'
            }`}
          />
          {goalsError && <p className="text-xs text-red-400 mt-1.5">{goalsError}</p>}
        </div>
      )}

      {/* ── Hours slider ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-brand-400" />
          <p className="text-sm font-semibold text-surface-200">Hours Per Week</p>
          <span className="ml-auto text-brand-400 font-black text-lg">{hours} hrs/wk</span>
        </div>
        <input
          type="range"
          min={1}
          max={40}
          value={hours}
          onChange={e => setHours(Number(e.target.value))}
          className="w-full h-2 bg-surface-700 rounded-full appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-xs text-surface-600 mt-1">
          <span>1 hr</span>
          <span>40 hrs</span>
        </div>
      </div>

      {/* ── Target date ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-brand-400" />
          <p className="text-sm font-semibold text-surface-200">Target Placement Date</p>
        </div>
        <input
          type="date"
          min={minDate}
          value={targetDate}
          onChange={handleDateChange}
          className={`w-full bg-surface-800 border rounded-xl px-4 py-2.5 text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors ${
            dateError ? 'border-red-500' : 'border-surface-700 focus:border-brand-500'
          }`}
        />
        {dateError && <p className="text-xs text-red-400 mt-1.5">{dateError}</p>}
      </div>

      {/* ── Preparation stage ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-brand-400" />
          <p className="text-sm font-semibold text-surface-200">Current Preparation Stage</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STAGES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStage(s.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                stage === s.id
                  ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                  : 'border-surface-700 bg-surface-800 text-surface-300 hover:border-surface-600'
              }`}
            >
              <p className="text-sm font-bold">{s.label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{s.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Submit button ───────────────────────────────────── */}
      <Button
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="w-full rounded-xl"
        icon={!loading && <Sparkles size={16} />}
      >
        {loading ? 'Generating Plan...' : 'Generate Plan'}
      </Button>
    </div>
  )
}
