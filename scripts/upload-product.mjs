/**
 * Uploads a product archive to the private Supabase Storage bucket and points
 * the product row at it.
 *
 *   node scripts/upload-product.mjs --slug meterkit --file ./meterkit.zip
 *
 * The archive uploaded here must be the clean product: the download route
 * injects LICENSE.txt (watermarked per buyer) at delivery time.
 */
import fs from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const STANDARD_UPLOAD_LIMIT_BYTES = 50 * 1024 * 1024

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]
    if (key === '--slug' || key === '--file') {
      args[key.slice(2)] = argv[i + 1]
      i += 1
    } else if (key === '--dry-run') {
      args.dryRun = true
    }
  }
  return args
}

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const { slug, file, dryRun } = parseArgs(process.argv.slice(2))

if (!slug || !file) {
  fail(
    'Usage: node scripts/upload-product.mjs --slug <product-slug> --file <path-to.zip> [--dry-run]',
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_PRODUCTS_BUCKET ?? 'products'

if (!supabaseUrl || !serviceKey) {
  fail(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
  )
}

const filePath = path.resolve(file)

if (!fs.existsSync(filePath)) {
  fail(`File not found: ${filePath}`)
}

const buffer = fs.readFileSync(filePath)

if (buffer.subarray(0, 2).toString() !== 'PK') {
  fail(`${path.basename(filePath)} is not a ZIP archive (missing PK header)`)
}

if (buffer.length > STANDARD_UPLOAD_LIMIT_BYTES) {
  fail(
    `File is ${(buffer.length / 1024 / 1024).toFixed(1)} MB. Standard upload tops out at 50 MB — ` +
      'upload this one through the Supabase dashboard (resumable) and then rerun with --dry-run to set storage_path.',
  )
}

const storagePath = `${slug}/${slug}.zip`
const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
}

console.log(`\nProduct : ${slug}`)
console.log(`Archive : ${filePath}`)
console.log(`Size    : ${(buffer.length / 1024).toFixed(1)} KB`)
console.log(`Target  : ${bucket}/${storagePath}`)

async function findProduct() {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=id,name,storage_path,status`,
    { headers },
  )
  const rows = await res.json()
  if (!res.ok) fail(`Product lookup failed: ${JSON.stringify(rows)}`)
  if (!rows.length) fail(`No product with slug "${slug}"`)
  return rows[0]
}

async function upload() {
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/zip',
        'x-upsert': 'true',
      },
      body: buffer,
    },
  )

  if (!res.ok) {
    fail(`Upload failed (HTTP ${res.status}): ${await res.text()}`)
  }
}

async function setStoragePath() {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ storage_path: storagePath }),
    },
  )

  const body = await res.json()
  if (!res.ok) fail(`Could not update storage_path: ${JSON.stringify(body)}`)
  return body[0]
}

async function verify() {
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`,
    { headers },
  )
  if (!res.ok) fail(`Verification download failed (HTTP ${res.status})`)
  const stored = Buffer.from(await res.arrayBuffer())
  if (stored.length !== buffer.length) {
    fail(
      `Size mismatch after upload: sent ${buffer.length}, stored ${stored.length}`,
    )
  }
  return stored.length
}

async function run() {
  const product = await findProduct()
  console.log(`Found   : ${product.name} (status: ${product.status})`)

  if (product.storage_path && product.storage_path !== storagePath) {
    console.log(`Note    : replacing previous path "${product.storage_path}"`)
  }

  if (dryRun) {
    console.log('\n--dry-run: nothing uploaded.\n')
    return
  }

  await upload()
  console.log('Uploaded ✓')

  const updated = await setStoragePath()
  console.log(`storage_path set to "${updated.storage_path}" ✓`)

  const size = await verify()
  console.log(`Verified ✓ (${(size / 1024).toFixed(1)} KB readable by service role)`)

  console.log(
    `\nDone. Buyers of "${product.name}" now receive this archive` +
      (product.status === 'published' ? '.' : ' once the product is published.') +
      '\n',
  )
}

run().catch((error) => {
  fail(error.message)
})
