import nodemailer from 'nodemailer'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getTransporter() {
  const host = process.env.ZOHO_SMTP_HOST ?? 'smtp.zoho.com'
  const port = Number(process.env.ZOHO_SMTP_PORT ?? 465)
  const user = process.env.ZOHO_SMTP_USER
  const pass = process.env.ZOHO_SMTP_PASSWORD

  if (!user || !pass) {
    throw new Error('Zoho SMTP credentials are not configured')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

function getFromAddress() {
  return (
    process.env.ZOHO_EMAIL_FROM ??
    process.env.ZOHO_SMTP_USER ??
    'support@couto.software'
  )
}

function getToAddresses() {
  const to = process.env.ZOHO_EMAIL_TO ?? 'tarcisio@couto.software'
  return to.split(',').map((email) => email.trim())
}

export async function sendEmail({
  subject,
  html,
  replyTo,
}: {
  subject: string
  html: string
  replyTo?: string
}) {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: `Couto Software House <${getFromAddress()}>`,
    to: getToAddresses(),
    replyTo,
    subject,
    html,
  })
}

export function buildContactEmailHtml({
  name,
  email,
  company,
  phone,
  message,
  budgetLabel,
}: {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  budgetLabel?: string
}) {
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    ${budgetLabel ? `<p><strong>Budget:</strong> ${escapeHtml(budgetLabel)}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `
}

export function buildNewsletterEmailHtml({ email }: { email: string }) {
  return `
    <h2>New Newsletter Subscription</h2>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p>Submitted from the website footer newsletter form.</p>
  `
}
