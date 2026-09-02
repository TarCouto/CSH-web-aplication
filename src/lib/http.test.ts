import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isSameOrigin } from './http'

// Outside production env.appUrl falls back to http://localhost:3000, which is
// the origin these requests are checked against.
const SITE = 'http://localhost:3000'

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
    assert.equal(
      isSameOrigin(requestWith({ origin: 'https://localhost.evil.example' })),
      false,
    )
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
