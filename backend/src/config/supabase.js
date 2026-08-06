import { createClient } from '@supabase/supabase-js'

const url    = process.env.SUPABASE_URL
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !svcKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
}

/** Service-role client – bypasses RLS for server-side operations */
export const supabase = createClient(url, svcKey, {
  auth: { persistSession: false },
})
