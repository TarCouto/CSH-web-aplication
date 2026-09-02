import fs from 'node:fs'

function stripSslMode(connectionString) {
  return connectionString
    .replace(/([?&])sslmode=[^&]*(?=&|$)/gi, '$1')
    .replace(/[?&]$/, '')
    .replace(/\?&/, '?')
}

/**
 * Shared Postgres connection options for db scripts.
 * TLS is verified by default. Override with PGSSL_CA_FILE or
 * PGSSL_REJECT_UNAUTHORIZED=false when the platform CA bundle is unavailable.
 */
export function resolvePgClientOptions() {
  const rawConnectionString =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL

  if (!rawConnectionString) {
    console.error(
      'Missing POSTGRES_URL_NON_POOLING (or POSTGRES_URL) in .env.local',
    )
    process.exit(1)
  }

  const sslDisabled = /(?:^|[?&])sslmode=disable(?:&|$)/i.test(
    rawConnectionString,
  )

  if (sslDisabled) {
    return {
      connectionString: rawConnectionString,
      ssl: false,
    }
  }

  const caPath = process.env.PGSSL_CA_FILE?.trim()
  const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false'
  const connectionString = stripSslMode(rawConnectionString)

  if (caPath) {
    return {
      connectionString,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(caPath, 'utf8'),
      },
    }
  }

  return {
    connectionString,
    ssl: { rejectUnauthorized },
  }
}
