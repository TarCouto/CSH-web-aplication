import { NextResponse } from 'next/server'

import { buildNewsletterEmailHtml, sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await sendEmail({
      subject: `Newsletter subscription: ${normalizedEmail}`,
      html: buildNewsletterEmailHtml({ email: normalizedEmail }),
      replyTo: normalizedEmail,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 },
    )
  }
}
