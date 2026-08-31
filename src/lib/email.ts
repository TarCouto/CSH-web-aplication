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
  to,
}: {
  subject: string
  html: string
  replyTo?: string
  to?: string | string[]
}) {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: `Couto Software House <${getFromAddress()}>`,
    to: to ?? getToAddresses(),
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

export function buildPurchaseEmailHtml({
  productName,
  amountLabel,
  dashboardUrl,
}: {
  productName: string
  amountLabel: string
  dashboardUrl: string
}) {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #171717;">
      <h2 style="margin-bottom: 8px;">Thank you for your purchase</h2>
      <p style="color: #525252; margin-top: 0;">
        Your order with Couto Software House is confirmed.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <tr>
          <td style="padding: 8px 0; color: #525252;">Product</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">
            ${escapeHtml(productName)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #525252;">Amount paid</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">
            ${escapeHtml(amountLabel)}
          </td>
        </tr>
      </table>
      <p style="margin: 24px 0;">
        <a
          href="${escapeHtml(dashboardUrl)}"
          style="display: inline-block; background: #171717; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 9999px;"
        >
          Go to your dashboard
        </a>
      </p>
      <p style="color: #525252; font-size: 14px;">
        Download your product from the dashboard. Each copy includes a traceable license file.
      </p>
    </div>
  `
}
