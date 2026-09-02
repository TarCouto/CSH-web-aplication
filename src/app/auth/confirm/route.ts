import { NextResponse } from 'next/server'

import {
  isSignupConfirmFlow,
  SIGNUP_CONFIRM_FAILED_PATH,
} from '@/lib/auth'
import { parseOtpType } from '@/lib/verify-email-otp'

/** Legacy email links — redirect to click-to-confirm (never verify on GET). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const typeParam = searchParams.get('type')
  const nextParam = searchParams.get('next')

  if (!tokenHash || !parseOtpType(typeParam)) {
    const failPath = isSignupConfirmFlow(nextParam)
      ? SIGNUP_CONFIRM_FAILED_PATH
      : '/login?error=confirm_failed'
    return NextResponse.redirect(`${origin}${failPath}`)
  }

  const confirmPath =
    isSignupConfirmFlow(nextParam) || typeParam === 'signup'
      ? '/signup/confirm'
      : '/confirm'

  const target = new URL(confirmPath, origin)
  target.searchParams.set('token_hash', tokenHash)
  if (typeParam) target.searchParams.set('type', typeParam)
  if (nextParam) target.searchParams.set('next', nextParam)

  return NextResponse.redirect(target)
}
