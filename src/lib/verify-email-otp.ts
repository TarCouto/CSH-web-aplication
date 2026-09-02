import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js'

import { isSignupConfirmFlow } from '@/lib/auth'
import { type Database } from '@/lib/supabase/types'

export const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  'email',
  'recovery',
  'signup',
  'magiclink',
  'invite',
  'email_change',
])

export function parseOtpType(value: string | null): EmailOtpType | null {
  if (!value || !ALLOWED_OTP_TYPES.has(value as EmailOtpType)) {
    return null
  }
  return value as EmailOtpType
}

/** Supabase token hashes are hex/base64url-ish; reject anything else before spending a verify call. */
const TOKEN_HASH_PATTERN = /^[A-Za-z0-9_-]{16,256}$/

export function parseTokenHash(value: string | null): string | null {
  if (!value) return null

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return null
  }

  const trimmed = decoded.trim()
  return TOKEN_HASH_PATTERN.test(trimmed) ? trimmed : null
}

/** Signup confirmation may accept signup or email; other flows use the URL type only. */
export function otpTypesToTry(
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

function shouldRetryWithAlternateType(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('invalid') ||
    lower.includes('otp') ||
    lower.includes('type')
  )
}

export async function verifyEmailOtp(
  supabase: SupabaseClient<Database>,
  tokenHash: string,
  typeParam: EmailOtpType,
  nextParam: string | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const types = otpTypesToTry(typeParam, nextParam)
  let lastMessage = 'Verification failed'

  for (const otpType of types) {
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    })

    if (!error) {
      return { ok: true }
    }

    lastMessage = error.message
    console.error('[auth/confirm] verifyOtp failed', {
      type: otpType,
      message: error.message,
    })

    if (!shouldRetryWithAlternateType(error.message)) {
      break
    }
  }

  return { ok: false, message: lastMessage }
}
