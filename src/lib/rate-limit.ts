const store = new Map<string, { count: number; resetAt: number }>()

export function __resetRateLimit(): void {
  store.clear()
}

export function rateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): { allowed: boolean; remaining: number; resetAt: number } {
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
