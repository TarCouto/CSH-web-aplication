import { NextResponse } from 'next/server'

import { buildContactEmailHtml, sendEmail } from '@/lib/email'

const budgetLabels: Record<string, string> = {
  '1': '$1K – $5K',
  '5': '$5K – $10K',
  '10': '$10K – $25K',
  '25': '$25K – $50K',
  '50': '$50K – $100K',
  '100': 'More than $100K',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, phone, message, budget } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 },
      )
    }

    const budgetLabel = budget ? budgetLabels[budget] || budget : undefined

    await sendEmail({
      subject: `New lead from ${name}${company ? ` at ${company}` : ''}`,
      html: buildContactEmailHtml({
        name,
        email,
        company,
        phone,
        message,
        budgetLabel,
      }),
      replyTo: email,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    )
  }
}
