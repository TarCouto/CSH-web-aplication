import { createClient } from '@supabase/supabase-js'

import { env } from '@/lib/env'
import { type Database } from '@/lib/supabase/types'

// Bypasses RLS; never import in client components.
export function createServiceClient() {
  const url = env.supabase.url
  if (!url) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  return createClient<Database>(url, env.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
