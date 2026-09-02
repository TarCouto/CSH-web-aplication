import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import pg from 'pg'

import { resolvePgClientOptions } from './pg-config.mjs'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')

const client = new pg.Client(resolvePgClientOptions())

async function ensureMigrationsTable() {
  await client.query(`
    create table if not exists public.schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    );
  `)
  await client.query(`
    alter table public.schema_migrations enable row level security;
  `)
}

async function appliedVersions() {
  const { rows } = await client.query(
    'select version from public.schema_migrations',
  )
  return new Set(rows.map((row) => row.version))
}

async function run() {
  await client.connect()
  await ensureMigrationsTable()

  const applied = await appliedVersions()

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  let count = 0

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip   ${file}`)
      continue
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf8')

    try {
      await client.query('begin')
      await client.query(sql)
      await client.query(
        'insert into public.schema_migrations (version) values ($1)',
        [file],
      )
      await client.query('commit')
      console.log(`apply  ${file}`)
      count += 1
    } catch (error) {
      await client.query('rollback')
      console.error(`fail   ${file}`)
      throw error
    }
  }

  console.log(`\nDone. ${count} migration(s) applied.`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end()
  })
