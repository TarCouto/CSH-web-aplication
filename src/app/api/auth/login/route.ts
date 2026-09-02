import { NextResponse } from 'next/server'

import { getClientIp } from '@/lib/get-client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let email = ''
  let password = ''

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }
    email = String(body.email ?? '').trim().toLowerCase()
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
  const ipLimit = await rateLimit(`login:ip:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  const emailLimit = await rateLimit(`login:email:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })

  if (!ipLimit.allowed || !emailLimit.allowed) {
    const resetAt = Math.max(ipLimit.resetAt, emailLimit.resetAt)
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait a few minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      },
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 },
    )
  }

  return NextResponse.json({ ok: true })
}
