import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { serverSessionCookieOptions } from '@/lib/auth'
import { getPublicSupabaseConfig } from '@/lib/env'
import { type Database } from '@/lib/supabase/types'

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getPublicSupabaseConfig()

  return createServerClient<Database>(url, anonKey, {
    cookieOptions: serverSessionCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if there is middleware refreshing sessions.
        }
      },
    },
  })
}
