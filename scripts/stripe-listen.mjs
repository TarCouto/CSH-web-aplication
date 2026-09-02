import { spawn } from 'node:child_process'

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const apiKey = process.env.STRIPE_SECRET_KEY
if (!apiKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local')
  process.exit(1)
}

const child = spawn(
  'npx',
  [
    '--yes',
    '@stripe/cli',
    'listen',
    '--forward-to',
    'localhost:3000/api/stripe/webhook',
    `--api-key=${apiKey}`,
  ],
  { shell: true, stdio: 'inherit' },
)

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
