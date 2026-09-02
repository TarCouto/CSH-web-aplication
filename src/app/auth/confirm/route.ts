import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

import { safeRedirectPath } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  'email',
  'recovery',
  'signup',
  'magiclink',
  'invite',
  'email_change',
])

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const typeParam = searchParams.get('type')
  const next = safeRedirectPath(searchParams.get('next'))

  if (
    !tokenHash ||
    !typeParam ||
    !ALLOWED_OTP_TYPES.has(typeParam as EmailOtpType)
  ) {
    console.error('[auth/confirm] Missing or invalid token_hash/type', {
      type: typeParam,
      hasTokenHash: Boolean(tokenHash),
    })
    return NextResponse.redirect(`${origin}/login?error=confirm_failed`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type: typeParam as EmailOtpType,
    token_hash: tokenHash,
  })

  if (error) {
    console.error('[auth/confirm] verifyOtp failed', {
      type: typeParam,
      message: error.message,
    })
    return NextResponse.redirect(`${origin}/login?error=confirm_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
