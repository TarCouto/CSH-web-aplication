import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'

import { __resetRateLimit, rateLimit } from './rate-limit'

function clearPostgresRateLimitEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
}

describe('rateLimit', () => {
  beforeEach(() => {
    __resetRateLimit()
    clearPostgresRateLimitEnv()
  })

  afterEach(() => {
    mock.timers.reset()
    clearPostgresRateLimitEnv()
  })

  it('allows the first N requests and blocks the N+1 request', async () => {
    const limit = 3

    for (let i = 0; i < limit; i++) {
      const result = await rateLimit('user-1', { limit, windowMs: 60000 })
      assert.equal(result.allowed, true)
      assert.equal(result.remaining, limit - i - 1)
    }

    const blocked = await rateLimit('user-1', { limit, windowMs: 60000 })
    assert.equal(blocked.allowed, false)
    assert.equal(blocked.remaining, 0)
  })

  it('tracks different keys independently', async () => {
    const limit = 2

    await rateLimit('user-a', { limit, windowMs: 60000 })
    await rateLimit('user-a', { limit, windowMs: 60000 })

    const blockedA = await rateLimit('user-a', { limit, windowMs: 60000 })
    assert.equal(blockedA.allowed, false)

    const allowedB = await rateLimit('user-b', { limit, windowMs: 60000 })
    assert.equal(allowedB.allowed, true)
    assert.equal(allowedB.remaining, limit - 1)
  })

  it('resets the counter after the window expires', async () => {
    mock.timers.enable({ apis: ['Date'], now: 1_000 })

    const limit = 2
    const windowMs = 60_000

    await rateLimit('window-key', { limit, windowMs })
    await rateLimit('window-key', { limit, windowMs })

    const blocked = await rateLimit('window-key', { limit, windowMs })
    assert.equal(blocked.allowed, false)

    mock.timers.tick(windowMs + 1)

    const allowed = await rateLimit('window-key', { limit, windowMs })
    assert.equal(allowed.allowed, true)
    assert.equal(allowed.remaining, limit - 1)
  })
})
