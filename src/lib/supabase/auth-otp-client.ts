import { createClient } from '@supabase/supabase-js'

import { getPublicSupabaseConfig } from '@/lib/env'
import { type Database } from '@/lib/supabase/types'

/**
 * Stateless client on the implicit flow (no PKCE). signUp and verifyOtp with
 * this client produce and accept plain OTP tokens that can be confirmed from
 * any device. The @supabase/ssr client forces PKCE, whose `pkce_` token_hash
 * requires a code verifier bound to the originating browser — so email links
 * opened in webmail or on another device fail with 403.
 */
export function createOtpClient() {
  const { url, anonKey } = getPublicSupabaseConfig()

  return createClient<Database>(url, anonKey, {
    auth: {
      flowType: 'implicit',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
