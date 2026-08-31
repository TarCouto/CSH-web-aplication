import { createBrowserClient } from '@supabase/ssr'

import { sessionCookieOptions } from '@/lib/auth'
import { getPublicSupabaseConfig } from '@/lib/env'
import { type Database } from '@/lib/supabase/types'

export function createClient() {
  const { url, anonKey } = getPublicSupabaseConfig()
  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions: sessionCookieOptions,
  })
}
