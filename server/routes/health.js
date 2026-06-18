const express = require('express')
const router  = express.Router()

/**
 * GET /api/health — returns server status and timestamp
 * Used by uptime monitors and frontend health checks
 */
router.get('/', (req, res) => {
  res.json({
    status:    'ok',
    message:   'Student OS API is running',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  })
})

module.exports = router
