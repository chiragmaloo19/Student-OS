const supabaseAdmin = require('../lib/supabaseAdmin')

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized - No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized - Invalid token' })
    }

    // Fetch profile to get role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized - Profile not found' })
    }

    req.user = {
      ...user,
      profile
    }

    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ status: 'error', message: 'Internal server error during authentication' })
  }
}

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.profile || req.user.profile.role !== role) {
      return res.status(403).json({ status: 'error', message: `Forbidden - Requires ${role} role` })
    }
    next()
  }
}

module.exports = {
  requireAuth,
  requireRole
}
