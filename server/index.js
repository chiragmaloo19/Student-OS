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
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Request logger ───────────────────────────────────────────
app.use(logger)

// ── Routes ───────────────────────────────────────────────────
app.use('/api/health', healthRouter)
// TODO Day 2+: import and mount feature routers here
app.use('/api/auth',      require('./routes/authRoutes'))
// app.use('/api/tasks',     require('./routes/tasks'))
// app.use('/api/dsa',       require('./routes/dsa'))
// app.use('/api/placement', require('./routes/placement'))
// app.use('/api/habits',    require('./routes/habits'))
// app.use('/api/admin',     require('./routes/admin'))

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
