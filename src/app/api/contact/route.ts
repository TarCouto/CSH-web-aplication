import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const budgetLabels: Record<string, string> = {
      '25': '$25K – $50K',
      '50': '$50K – $100K',
      '100': '$100K – $150K',
      '150': 'More than $150K',
    }

    await resend.emails.send({
      from: 'Couto Software House <onboarding@resend.dev>',
      to: ['tarcisiocouto@outlook.com'],
      subject: `New lead from ${name}${company ? ` at ${company}` : ''}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${budget ? `<p><strong>Budget:</strong> ${budgetLabels[budget] || budget}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    )
  }
}
