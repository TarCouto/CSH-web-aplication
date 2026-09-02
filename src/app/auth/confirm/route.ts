import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

import {
  isSignupConfirmFlow,
  safeRedirectPath,
  SIGNUP_CONFIRM_FAILED_PATH,
} from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  'email',
  'recovery',
  'signup',
  'magiclink',
  'invite',
  'email_change',
])

function confirmFailureRedirect(origin: string, nextParam: string | null) {
  if (isSignupConfirmFlow(nextParam)) {
    return NextResponse.redirect(`${origin}${SIGNUP_CONFIRM_FAILED_PATH}`)
  }
  return NextResponse.redirect(`${origin}/login?error=confirm_failed`)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const typeParam = searchParams.get('type')
  const nextParam = searchParams.get('next')
  const next = safeRedirectPath(nextParam)

  if (
    !tokenHash ||
    !typeParam ||
    !ALLOWED_OTP_TYPES.has(typeParam as EmailOtpType)
  ) {
    console.error('[auth/confirm] Missing or invalid token_hash/type', {
      type: typeParam,
      hasTokenHash: Boolean(tokenHash),
    })
    return confirmFailureRedirect(origin, nextParam)
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
    return confirmFailureRedirect(origin, nextParam)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
