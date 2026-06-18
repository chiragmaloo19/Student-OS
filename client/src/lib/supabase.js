import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase.js] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Please fill in client/.env.local before Day 2.'
  )
}

/** Supabase browser client — uses the anon key, respects Row Level Security */
const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '')

export { supabase }
export default supabase
