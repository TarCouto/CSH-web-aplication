import { readFileSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { join } from 'node:path'

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const apiKey = process.env.STRIPE_SECRET_KEY
if (!apiKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local')
  process.exit(1)
}

const child = spawn(
  'npx',
  ['--yes', '@stripe/cli', 'listen', '--print-secret', `--api-key=${apiKey}`],
  { shell: true },
)

let output = ''

child.stdout.on('data', (chunk) => {
  output += chunk.toString()
})
child.stderr.on('data', (chunk) => {
  output += chunk.toString()
})

const timeout = setTimeout(() => {
  child.kill()
}, 25000)

child.on('close', () => {
  clearTimeout(timeout)
  const match = output.match(/whsec_[A-Za-z0-9]+/)
  if (!match) {
    console.error('Could not read webhook signing secret from Stripe CLI.')
    console.error(output.slice(0, 500))
    process.exit(1)
  }

  const secret = match[0]
  const envPath = join(process.cwd(), '.env.local')
  const current = readFileSync(envPath, 'utf8')
  const next = current.includes('STRIPE_WEBHOOK_SECRET=')
    ? current.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, `STRIPE_WEBHOOK_SECRET=${secret}`)
    : `${current.trimEnd()}\nSTRIPE_WEBHOOK_SECRET=${secret}\n`

  writeFileSync(envPath, next)
  console.log('Wrote STRIPE_WEBHOOK_SECRET to .env.local')
})
