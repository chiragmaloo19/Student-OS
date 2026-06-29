/** PlanDisplay — parses and renders the AI-generated plan with visual hierarchy */
import { useState } from 'react'
import { Copy, RefreshCw, Check, Clock } from 'lucide-react'
import { Button } from '../ui/Button'
import { useToast } from '../../context/ToastContext'

/** Parse the raw plan text into named sections */
function parsePlanSections(text) {
  const sections = []
  const lines = text.split('\n')
  let currentSection = null
  let currentLines = []

  const SECTION_HEADERS = [
    'WEEKLY STUDY PLAN', 'OVERVIEW', 'DAILY SCHEDULE',
    'TOPIC BREAKDOWN', 'REVISION STRATEGY', 'WEEKLY MILESTONES',
  ]

  const flush = () => {
    if (currentSection) {
      sections.push({ title: currentSection, content: currentLines.join('\n').trim() })
    }
    currentLines = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const isHeader = SECTION_HEADERS.some(h => trimmed === h || trimmed.startsWith(h + ' '))
    const isSeparator = /^[=\-]{3,}$/.test(trimmed)

    if (isHeader) {
      flush()
      currentSection = trimmed
    } else if (!isSeparator && currentSection) {
      currentLines.push(line)
    }
  }
  flush()

  return sections.filter(s => s.title !== 'WEEKLY STUDY PLAN' && s.content.length > 0)
}

/** Render a daily schedule section as a clean list */
function DailyScheduleSection({ content }) {
  const days = content.split('\n').filter(l => l.trim())
  return (
    <div className="flex flex-col gap-2">
      {days.map((line, i) => {
        const [day, ...rest] = line.split(':')
        return (
          <div key={i} className="flex gap-3 items-start py-2 border-b border-surface-800/50 last:border-0">
            <span className="text-brand-400 font-bold text-xs w-20 shrink-0 pt-0.5">
              {day?.trim()}
            </span>
            <span className="text-surface-300 text-sm">{rest.join(':').trim()}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Render the topic breakdown section as individual mini-cards */
function TopicBreakdownSection({ content }) {
  const blocks = content.split(/\n(?=- Topic:)/g).filter(b => b.trim())
  if (blocks.length === 0) {
    return <p className="text-surface-300 text-sm whitespace-pre-line">{content}</p>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter(l => l.trim())
        return (
          <div key={i} className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/60">
            {lines.map((line, j) => {
              const [label, ...val] = line.replace(/^- /, '').split(':')
              if (!val.length) return <p key={j} className="text-surface-400 text-xs">{line}</p>
              return (
                <div key={j} className="flex gap-2 text-xs mb-1 last:mb-0">
                  <span className="text-brand-400 font-semibold shrink-0">{label.trim()}:</span>
                  <span className="text-surface-300">{val.join(':').trim()}</span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/** Render milestones as a numbered timeline */
function MilestonesSection({ content }) {
  const weeks = content.split('\n').filter(l => l.trim())
  return (
    <div className="flex flex-col gap-3">
      {weeks.map((line, i) => {
        const [week, ...rest] = line.split(':')
        return (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 text-xs font-black shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="text-xs font-bold text-brand-300">{week?.trim()}</p>
              <p className="text-sm text-surface-300">{rest.join(':').trim()}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Generic section renderer — bullet points for revision strategy, plain for overview */
function GenericSection({ content }) {
  const lines = content.split('\n').filter(l => l.trim())
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•')
        return isBullet ? (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-brand-400 mt-1.5 shrink-0">•</span>
            <p className="text-surface-300 text-sm">{line.replace(/^[-•]\s*/, '')}</p>
          </div>
        ) : (
          <p key={i} className="text-surface-300 text-sm leading-relaxed">{line}</p>
        )
      })}
    </div>
  )
}

/** Render the appropriate sub-component for each section type */
function SectionContent({ title, content }) {
  if (title === 'DAILY SCHEDULE') return <DailyScheduleSection content={content} />
  if (title === 'TOPIC BREAKDOWN') return <TopicBreakdownSection content={content} />
  if (title === 'WEEKLY MILESTONES') return <MilestonesSection content={content} />
  return <GenericSection content={content} />
}

/** PlanDisplay — main component to render the formatted AI plan with copy/regenerate */
export default function PlanDisplay({ planText, onRegenerate, generatedAt }) {
  const { showToast } = useToast()
  const [copied, setCopied]   = useState(false)

  const sections = parsePlanSections(planText)

  /** Copy raw plan text to clipboard and show toast */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(planText)
      setCopied(true)
      showToast('Plan copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Failed to copy', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-surface-500 text-xs">
          <Clock size={12} />
          <span>{generatedAt ? `Generated ${generatedAt}` : 'Generated just now'}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
            {copied ? 'Copied!' : 'Copy Plan'}
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate} icon={<RefreshCw size={14} />}>
            Regenerate
          </Button>
        </div>
      </div>

      {/* Plan sections */}
      {sections.map((section, i) => (
        <div key={i} className="bg-surface-800/40 rounded-2xl border border-surface-700/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-surface-700/60 bg-surface-800/60">
            <h3 className="text-sm font-bold text-surface-100 tracking-wide">
              {section.title.charAt(0) + section.title.slice(1).toLowerCase().replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="px-5 py-4">
            <SectionContent title={section.title} content={section.content} />
          </div>
        </div>
      ))}

      {/* Fallback if parsing fails */}
      {sections.length === 0 && (
        <pre className="text-surface-300 text-sm whitespace-pre-wrap leading-relaxed bg-surface-800/40 rounded-2xl p-5">
          {planText}
        </pre>
      )}
    </div>
  )
}
