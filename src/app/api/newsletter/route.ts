import { NextResponse } from 'next/server'

import { buildNewsletterEmailHtml, sendEmail } from '@/lib/email'
import { getClientIp } from '@/lib/get-client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/validation'

const TEN_MINUTES_MS = 10 * 60 * 1000

function invalidPayloadResponse() {
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit(`newsletter:ip:${ip}`, {
      limit: 3,
      windowMs: TEN_MINUTES_MS,
    })

    if (!limit.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((limit.resetAt - Date.now()) / 1000),
      )
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        },
      )
    }

    const body = await request.json()
    const { email } = body

    if (typeof email !== 'string') {
      return invalidPayloadResponse()
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || normalizedEmail.length > 320) {
      return invalidPayloadResponse()
    }

    if (!isValidEmail(normalizedEmail)) {
      return invalidPayloadResponse()
    }

    await sendEmail({
      subject: `Newsletter subscription: ${normalizedEmail}`,
      html: buildNewsletterEmailHtml({ email: normalizedEmail }),
      replyTo: normalizedEmail,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscription failed:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 },
    )
  }
}
