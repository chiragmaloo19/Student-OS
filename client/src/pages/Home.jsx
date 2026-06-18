import { Link } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Shield, Zap, CheckCircle2, ArrowRight, GraduationCap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

/** Home — landing page showcasing Student OS features */
const features = [
  { icon: <BookOpen size={20} />,       title: 'DSA Tracker',        desc: 'Track your LeetCode progress, difficulty breakdown, and daily streaks.' },
  { icon: <LayoutDashboard size={20} />, title: 'Task Manager',       desc: 'Prioritise daily tasks with deadlines, tags, and completion tracking.' },
  { icon: <Shield size={20} />,          title: 'Placement Hub',      desc: 'Log every application, interview round, and offer in one place.' },
  { icon: <Zap size={20} />,             title: 'AI Study Plans',     desc: 'Get personalised study plans powered by GPT-4o-mini based on your goals.' },
  { icon: <GraduationCap size={20} />,   title: 'CGPA Monitor',       desc: 'Track semester grades and project your cumulative GPA over time.' },
  { icon: <CheckCircle2 size={20} />,    title: 'Habit Tracker',      desc: 'Build consistent daily habits with streak counts and visual heatmaps.' },
]

export function Home() {
  return (
    <div className="min-h-screen bg-hero-gradient text-surface-100 font-lato">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="border-b border-surface-800/60 backdrop-blur-sm sticky top-0 z-50 bg-surface-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Student <span className="gradient-text">OS</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm" iconRight={<ArrowRight size={15} />}>Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center animate-fade-in">
        <Badge text="Day 1 — Foundation Complete ✓" color="brand" dot />
        <h1 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight leading-tight">
          Your Academic &amp; Placement<br />
          <span className="gradient-text">Operating System</span>
        </h1>
        <p className="mt-6 text-surface-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Student OS centralises everything — DSA practice, placement applications, CGPA, habits,
          and AI-powered study plans — in one beautiful dashboard built for college students.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
              Start for free
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="lg">
              View Dashboard →
            </Button>
          </Link>
        </div>

        {/* Glow orb decoration */}
        <div className="relative mt-20 mx-auto w-full max-w-4xl h-1 pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Card
              key={i}
              hover
              padding="lg"
              className="animate-slide-up group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400 mb-4 group-hover:bg-brand-500/25 transition-colors duration-200">
                {f.icon}
              </div>
              <h3 className="font-bold text-surface-100 mb-2">{f.title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-surface-800/60 py-8 text-center text-sm text-surface-500">
        <p>Student OS &copy; {new Date().getFullYear()} &mdash; Built for students, by students.</p>
      </footer>
    </div>
  )
}

export default Home
