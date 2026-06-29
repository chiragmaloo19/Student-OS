require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')

const logger       = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const healthRouter = require('./routes/health')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security & parsing middleware ────────────────────────────
app.use(helmet())

// Allow requests from both local dev and production Vercel URL
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Request logger ───────────────────────────────────────────
app.use(logger)

// ── Routes ───────────────────────────────────────────────────
app.use('/api/health', healthRouter)
app.use('/api/auth',      require('./routes/authRoutes'))
app.use('/api/platform',  require('./routes/platformRoutes'))
app.use('/api/resume',    require('./routes/resumeRoutes'))
// Day 6 — AI Planner + Admin Dashboard
app.use('/api/ai',        require('./routes/aiRoutes'))
app.use('/api/admin',     require('./routes/adminRoutes'))

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler (must be last) ─────────────────────
app.use(errorHandler)

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Student OS server running on http://localhost:${PORT}`)
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
