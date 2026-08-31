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

  const columns = await client.query(`
    select table_name, column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'profiles', 'products', 'orders', 'entitlements',
        'downloads', 'schema_migrations'
      )
    order by table_name, ordinal_position;
  `)

  const fks = await client.query(`
    select
      tc.table_name,
      kcu.column_name,
      ccu.table_name as foreign_table,
      ccu.column_name as foreign_column
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
     and ccu.table_schema = tc.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
    order by tc.table_name, kcu.column_name;
  `)

  const counts = await client.query(`
    select 'profiles' as name, count(*)::int as n from public.profiles
    union all select 'products', count(*)::int from public.products
    union all select 'orders', count(*)::int from public.orders
    union all select 'entitlements', count(*)::int from public.entitlements
    union all select 'downloads', count(*)::int from public.downloads;
  `)

  const migrations = await client.query(
    'select version, applied_at from public.schema_migrations order by version;',
  )

  const buckets = await client.query(
    'select id, name, public from storage.buckets order by id;',
  )

  console.log('MIGRATIONS:')
  for (const row of migrations.rows) {
    console.log(`  ${row.version}  ${row.applied_at.toISOString()}`)
  }

  console.log('\nROW COUNTS:')
  for (const row of counts.rows) console.log(`  ${row.name}: ${row.n}`)

  console.log('\nCOLUMNS:')
  let current = ''
  for (const row of columns.rows) {
    if (row.table_name !== current) {
      current = row.table_name
      console.log(`\n  ${current}`)
    }
    const nullable = row.is_nullable === 'YES' ? 'null' : 'not null'
    console.log(`    - ${row.column_name}  ${row.data_type}  ${nullable}`)
  }

  console.log('\nFOREIGN KEYS:')
  for (const row of fks.rows) {
    console.log(
      `  ${row.table_name}.${row.column_name} → ${row.foreign_table}.${row.foreign_column}`,
    )
  }

  console.log('\nSTORAGE:')
  for (const row of buckets.rows) {
    console.log(`  ${row.id} public=${row.public}`)
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
