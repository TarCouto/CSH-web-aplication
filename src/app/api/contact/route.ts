import { NextResponse } from 'next/server'

import { buildContactEmailHtml, sendEmail } from '@/lib/email'
import { getClientIp } from '@/lib/get-client-ip'
import { rateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/validation'

const budgetLabels: Record<string, string> = {
  '1': '$1K – $5K',
  '5': '$5K – $10K',
  '10': '$10K – $25K',
  '25': '$25K – $50K',
  '50': '$50K – $100K',
  '100': 'More than $100K',
}

const TEN_MINUTES_MS = 10 * 60 * 1000

function invalidPayloadResponse() {
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit(`contact:ip:${ip}`, {
      limit: 5,
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
    const { name, email, company, phone, message, budget } = body

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string'
    ) {
      return invalidPayloadResponse()
    }

    const optionalFields = [company, phone, budget] as const
    for (const field of optionalFields) {
      if (field !== undefined && field !== null && typeof field !== 'string') {
        return invalidPayloadResponse()
      }
    }

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedMessage = message.trim()
    const trimmedCompany = typeof company === 'string' ? company.trim() : ''
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : ''
    const trimmedBudget = typeof budget === 'string' ? budget.trim() : ''

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedMessage ||
      trimmedName.length > 200 ||
      trimmedEmail.length > 320 ||
      trimmedMessage.length > 5000 ||
      trimmedCompany.length > 500 ||
      trimmedPhone.length > 500 ||
      trimmedBudget.length > 500
    ) {
      return invalidPayloadResponse()
    }

    if (!isValidEmail(trimmedEmail)) {
      return invalidPayloadResponse()
    }

    const budgetLabel = trimmedBudget
      ? budgetLabels[trimmedBudget] || trimmedBudget
      : undefined

    await sendEmail({
      subject: `New lead from ${trimmedName}${trimmedCompany ? ` at ${trimmedCompany}` : ''}`,
      html: buildContactEmailHtml({
        name: trimmedName,
        email: trimmedEmail,
        company: trimmedCompany || undefined,
        phone: trimmedPhone || undefined,
        message: trimmedMessage,
        budgetLabel,
      }),
      replyTo: trimmedEmail,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form submission failed:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    )
  }
}
