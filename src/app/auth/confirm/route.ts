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

/** Confirm signup emails use type=signup; magic link uses email. Try both on signup flow. */
function otpTypesToTry(
  typeParam: EmailOtpType,
  nextParam: string | null,
): EmailOtpType[] {
  if (isSignupConfirmFlow(nextParam)) {
    const alternate: EmailOtpType =
      typeParam === 'signup' ? 'email' : 'signup'
    return typeParam === alternate ? [typeParam] : [typeParam, alternate]
  }
  return [typeParam]
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const rawTokenHash = searchParams.get('token_hash')
  const tokenHash = rawTokenHash
    ? decodeURIComponent(rawTokenHash)
    : null
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
  const types = otpTypesToTry(typeParam as EmailOtpType, nextParam)
  let lastError: { message: string } | null = null

  for (const otpType of types) {
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    lastError = error
    console.error('[auth/confirm] verifyOtp failed', {
      type: otpType,
      message: error.message,
    })
  }

  console.error('[auth/confirm] all verifyOtp attempts failed', {
    types,
    message: lastError?.message,
  })
  return confirmFailureRedirect(origin, nextParam)
}
