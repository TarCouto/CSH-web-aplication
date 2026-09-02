import { createServiceClient } from '@/lib/supabase/service'

const store = new Map<string, { count: number; resetAt: number }>()

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function __resetRateLimit(): void {
  store.clear()
}

function isPostgresRateLimitAvailable(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}

function memoryRateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): RateLimitResult {
  const limit = opts?.limit ?? 10
  const windowMs = opts?.windowMs ?? 60000
  const now = Date.now()

  let entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs }
    store.set(key, entry)
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count += 1

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

async function postgresRateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): Promise<RateLimitResult> {
  const limit = opts?.limit ?? 10
  const windowMs = opts?.windowMs ?? 60000
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000))

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })

    if (error) {
      console.error('Rate limit RPC failed, falling back to in-memory store:', error)
      return memoryRateLimit(key, opts)
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row || typeof row.allowed !== 'boolean') {
      console.error('Rate limit RPC returned unexpected payload, falling back to in-memory store')
      return memoryRateLimit(key, opts)
    }

    const retryAfterSeconds =
      typeof row.retry_after === 'number' && Number.isFinite(row.retry_after)
        ? Math.max(0, row.retry_after)
        : 0
    const resetAt =
      Date.now() +
      (retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : windowMs)

    if (!row.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt,
    }
  } catch (error) {
    console.error('Rate limit Postgres backend failed, falling back to in-memory store:', error)
    return memoryRateLimit(key, opts)
  }
}

export function rateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): Promise<RateLimitResult> {
  if (isPostgresRateLimitAvailable()) {
    return postgresRateLimit(key, opts)
  }

  return Promise.resolve(memoryRateLimit(key, opts))
}
