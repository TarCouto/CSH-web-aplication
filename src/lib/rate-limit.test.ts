import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'

import { __resetRateLimit, rateLimit } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    __resetRateLimit()
  })

  it('allows the first N requests and blocks the N+1 request', () => {
    const limit = 3

    for (let i = 0; i < limit; i++) {
      const result = rateLimit('user-1', { limit, windowMs: 60000 })
      assert.equal(result.allowed, true)
      assert.equal(result.remaining, limit - i - 1)
    }

    const blocked = rateLimit('user-1', { limit, windowMs: 60000 })
    assert.equal(blocked.allowed, false)
    assert.equal(blocked.remaining, 0)
  })

  it('tracks different keys independently', () => {
    const limit = 2

    rateLimit('user-a', { limit, windowMs: 60000 })
    rateLimit('user-a', { limit, windowMs: 60000 })

    const blockedA = rateLimit('user-a', { limit, windowMs: 60000 })
    assert.equal(blockedA.allowed, false)

    const allowedB = rateLimit('user-b', { limit, windowMs: 60000 })
    assert.equal(allowedB.allowed, true)
    assert.equal(allowedB.remaining, limit - 1)
  })
})
