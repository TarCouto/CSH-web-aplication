import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildFingerprint } from './delivery'

function extractLicenseId(fingerprint: string): string {
  const match = fingerprint.match(/^License ID: (.+)$/m)
  return match?.[1] ?? ''
}

describe('buildFingerprint', () => {
  const baseParams = {
    orderId: 'order-123',
    userId: 'user-456',
    productId: 'product-789',
    email: 'buyer@example.com',
    productName: 'Next.js Starter Kit',
  }

  it('produces a deterministic license id for the same inputs', () => {
    const first = buildFingerprint(baseParams)
    const second = buildFingerprint(baseParams)

    assert.equal(extractLicenseId(first), extractLicenseId(second))
  })

  it('produces different license ids for different inputs', () => {
    const first = buildFingerprint(baseParams)
    const second = buildFingerprint({
      ...baseParams,
      userId: 'user-other',
    })

    assert.notEqual(extractLicenseId(first), extractLicenseId(second))
  })

  it('includes the product name and email in the output', () => {
    const fingerprint = buildFingerprint(baseParams)

    assert.match(fingerprint, /Product: Next\.js Starter Kit/)
    assert.match(fingerprint, /Licensed to: buyer@example\.com/)
  })

  it('handles null orderId and email gracefully', () => {
    const fingerprint = buildFingerprint({
      orderId: null,
      userId: baseParams.userId,
      productId: baseParams.productId,
      email: null,
      productName: baseParams.productName,
    })

    assert.match(fingerprint, /Product: Next\.js Starter Kit/)
    assert.match(fingerprint, /Licensed to: unknown/)
    assert.match(fingerprint, /^License ID: [a-f0-9]{64}$/m)
  })
})
