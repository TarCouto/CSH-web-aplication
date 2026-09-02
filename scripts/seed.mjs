import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import pg from 'pg'

import { resolvePgClientOptions } from './pg-config.mjs'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedsDir = join(__dirname, '..', 'supabase', 'seeds')

const client = new pg.Client(resolvePgClientOptions())

async function run() {
  await client.connect()

  const files = readdirSync(seedsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  let count = 0

  for (const file of files) {
    const sql = readFileSync(join(seedsDir, file), 'utf8')

    try {
      await client.query('begin')
      await client.query(sql)
      await client.query('commit')
      console.log(`apply  ${file}`)
      count += 1
    } catch (error) {
      await client.query('rollback')
      console.error(`fail   ${file}`)
      throw error
    }
  }

  console.log(`\nDone. ${count} seed file(s) applied.`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end()
  })
