require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl     = process.env.SUPABASE_URL
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '[supabaseAdmin.js] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
    'Please fill in server/.env before Day 2.'
  )
}

/**
 * supabaseAdmin — service-role Supabase client that bypasses Row Level Security.
 * NEVER expose this client or its key to the frontend.
 * Used only for server-side operations: user management, admin queries, etc.
 */
const supabaseAdmin = createClient(
  supabaseUrl        ?? '',
  serviceRoleKey     ?? '',
  {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
    }
  }
)

module.exports = supabaseAdmin
