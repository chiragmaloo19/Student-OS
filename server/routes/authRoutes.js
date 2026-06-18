const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/authMiddleware')

// GET /api/auth/me
// Returns the currently authenticated user and their profile
router.get('/me', requireAuth, (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.user,
      profile: req.user.profile
    }
  })
})

module.exports = router
