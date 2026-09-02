import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { env } from './env'
import { isSameOrigin } from './http'

// Derived from the configured app URL so the suite behaves the same locally
// (localhost fallback) and in CI (NEXT_PUBLIC_APP_URL is set).
const SITE = new URL(env.appUrl).origin

function requestWith(headers: Record<string, string>): Request {
  return new Request(`${SITE}/api/checkout`, { headers })
}

describe('isSameOrigin', () => {
  it('accepts a matching Origin', () => {
    assert.equal(isSameOrigin(requestWith({ origin: SITE })), true)
  })

  it('rejects a foreign Origin', () => {
    assert.equal(
      isSameOrigin(requestWith({ origin: 'https://evil.example' })),
      false,
    )
  })

  it('rejects a look-alike host', () => {
    const lookAlike = `https://${new URL(SITE).hostname}.evil.example`
    assert.equal(isSameOrigin(requestWith({ origin: lookAlike })), false)
  })

  it('falls back to Referer when Origin is absent', () => {
    assert.equal(
      isSameOrigin(requestWith({ referer: `${SITE}/products` })),
      true,
    )
    assert.equal(
      isSameOrigin(requestWith({ referer: 'https://evil.example/page' })),
      false,
    )
  })

  it('allows requests that send neither header', () => {
    assert.equal(isSameOrigin(requestWith({})), true)
  })

  it('rejects a malformed Origin', () => {
    assert.equal(isSameOrigin(requestWith({ origin: 'not a url' })), false)
  })

  it('accepts the deployment host via x-forwarded-host', () => {
    assert.equal(
      isSameOrigin(
        requestWith({
          origin: 'https://preview.vercel.app',
          'x-forwarded-host': 'preview.vercel.app',
        }),
      ),
      true,
    )
  })
})
