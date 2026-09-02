import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import AdmZip from 'adm-zip'
import dotenv from 'dotenv'
import pg from 'pg'

import { resolvePgClientOptions } from './pg-config.mjs'

dotenv.config({ path: '.env.local' })

const STORAGE_PATH = 'meterkit/meterkit.zip'
const BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET ?? 'products'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

function buildPlaceholderZip() {
  const zip = new AdmZip()
  zip.addFile(
    'README.txt',
    Buffer.from(
      [
        'MeterKit — placeholder archive (test delivery)',
        '',
        'Replace this file in Supabase Storage (bucket "products",',
        `path "${STORAGE_PATH}") with the real source zip before going live.`,
        '',
        'Couto Software House',
      ].join('\n'),
      'utf8',
    ),
  )
  return zip.toBuffer()
}

const buffer = buildPlaceholderZip()
const uploadUrl = `${url}/storage/v1/object/${BUCKET}/${STORAGE_PATH}`
const uploadResponse = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${serviceKey}`,
    apikey: serviceKey,
    'Content-Type': 'application/zip',
    'x-upsert': 'true',
  },
  body: buffer,
})

if (!uploadResponse.ok) {
  const detail = await uploadResponse.text()
  console.error(`Upload failed (${uploadResponse.status}): ${detail}`)
  process.exit(1)
}

const client = new pg.Client(resolvePgClientOptions())
await client.connect()
const { rows } = await client.query(
  `
    update public.products
    set
      storage_path = $1,
      status = 'published',
      updated_at = now()
    where slug = 'meterkit'
    returning slug, status, storage_path
  `,
  [STORAGE_PATH],
)
await client.end()

if (rows.length === 0) {
  console.error('No products row with slug "meterkit". Run npm run db:seed first.')
  process.exit(1)
}

const tmpDir = join(dirname(fileURLToPath(import.meta.url)), '..', '.tmp')
mkdirSync(tmpDir, { recursive: true })
writeFileSync(join(tmpDir, 'meterkit.zip'), buffer)

console.log(`uploaded  ${BUCKET}/${STORAGE_PATH}`)
console.log(`updated   ${rows[0].slug}  ${rows[0].status}  ${rows[0].storage_path}`)
