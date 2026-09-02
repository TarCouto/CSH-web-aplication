import { NextResponse } from 'next/server'

import { safeRedirectPath } from '@/lib/auth'
import { createOtpClient } from '@/lib/supabase/auth-otp-client'
import {
  parseOtpType,
  parseTokenHash,
  verifyEmailOtp,
} from '@/lib/verify-email-otp'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { token_hash?: string; type?: string; next?: string }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const tokenHash = parseTokenHash(body.token_hash ?? null)
  const typeParam = parseOtpType(body.type ?? null)
  const nextParam = body.next ?? null
  const next = safeRedirectPath(nextParam)

  if (!tokenHash || !typeParam) {
    return NextResponse.json({ error: 'Invalid confirmation link' }, { status: 400 })
  }

  const supabase = createOtpClient()
  const result = await verifyEmailOtp(
    supabase,
    tokenHash,
    typeParam,
    nextParam,
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  return NextResponse.json({ redirect: next })
}
