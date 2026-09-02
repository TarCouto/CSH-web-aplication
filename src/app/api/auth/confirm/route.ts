import { NextResponse } from 'next/server'

import { safeRedirectPath } from '@/lib/auth'
import { getClientIp } from '@/lib/get-client-ip'
import { TEN_MINUTES_MS, tooManyRequestsResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { createOtpClient } from '@/lib/supabase/auth-otp-client'
import {
  parseOtpType,
  parseTokenHash,
  verifyEmailOtp,
} from '@/lib/verify-email-otp'

export const runtime = 'nodejs'

/** Generic on purpose: a specific reason tells a brute-forcer which guesses are close. */
const GENERIC_FAILURE = 'This confirmation link is invalid or has expired.'

export async function POST(request: Request) {
  let body: { token_hash?: string; type?: string; next?: string }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const ip = getClientIp(request)
  const limit = await rateLimit(`confirm:ip:${ip}`, {
    limit: 10,
    windowMs: TEN_MINUTES_MS,
  })

  if (!limit.allowed) {
    return tooManyRequestsResponse(
      limit,
      'Too many confirmation attempts. Please wait a few minutes.',
    )
  }

  const tokenHash = parseTokenHash(body.token_hash ?? null)
  const typeParam = parseOtpType(body.type ?? null)
  const nextParam = body.next ?? null
  const next = safeRedirectPath(nextParam)

  if (!tokenHash || !typeParam) {
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 400 })
  }

  const supabase = createOtpClient()
  const result = await verifyEmailOtp(
    supabase,
    tokenHash,
    typeParam,
    nextParam,
  )

  if (!result.ok) {
    // result.message is logged server-side by verifyEmailOtp; never returned.
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 400 })
  }

  return NextResponse.json({ redirect: next })
}
