import { NextResponse } from 'next/server'

import { SIGNUP_CONFIRM_SUCCESS_PATH } from '@/lib/auth'
import { getClientIp } from '@/lib/get-client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { SITE_URL } from '@/lib/site-url'
import { createOtpClient } from '@/lib/supabase/auth-otp-client'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let email = ''
  let password = ''

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }
    email = String(body.email ?? '')
      .trim()
      .toLowerCase()
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 },
    )
  }

  const ip = getClientIp(request)
  const ipLimit = await rateLimit(`signup:ip:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  const emailLimit = await rateLimit(`signup:email:${email}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })

  if (!ipLimit.allowed || !emailLimit.allowed) {
    const resetAt = Math.max(ipLimit.resetAt, emailLimit.resetAt)
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Too many signup attempts. Please wait a few minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      },
    )
  }

  const supabase = createOtpClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}${SIGNUP_CONFIRM_SUCCESS_PATH}`,
    },
  })

  if (error) {
    console.error('[auth/signup] signUp failed', { message: error.message })
    return NextResponse.json(
      { error: 'Could not create your account. Please try again.' },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
