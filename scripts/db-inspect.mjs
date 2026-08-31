import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })

const rawConnectionString =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL

const connectionString = rawConnectionString
  .replace(/([?&])sslmode=[^&]*/i, '$1')
  .replace(/[?&]$/, '')

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  await client.connect()

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name;
  `)
  console.log('TABLES (public):')
  for (const row of tables.rows) console.log('  -', row.table_name)

  const policies = await client.query(`
    select tablename, policyname, cmd, roles
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname;
  `)
  console.log('\nRLS POLICIES:')
  for (const row of policies.rows) {
    console.log(
      `  - ${row.tablename}.${row.policyname} [${row.cmd}] roles=${row.roles}`,
    )
  }

  const buckets = await client.query(
    'select id, name, public from storage.buckets order by id;',
  )
  console.log('\nSTORAGE BUCKETS:')
  for (const row of buckets.rows) {
    console.log(`  - ${row.id} (public=${row.public})`)
  }
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end()
  })
