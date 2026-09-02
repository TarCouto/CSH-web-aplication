import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildCheckoutSessionParams, isStripeCheckoutSessionId } from './checkout'

describe('isStripeCheckoutSessionId', () => {
  it('accepts Stripe checkout session ids', () => {
    assert.equal(isStripeCheckoutSessionId('cs_test_a1B2c3'), true)
    assert.equal(isStripeCheckoutSessionId('cs_live_a1B2c3'), true)
    assert.equal(isStripeCheckoutSessionId('cs_a1B2c3'), true)
  })

  it('rejects unrelated values', () => {
    assert.equal(isStripeCheckoutSessionId(''), false)
    assert.equal(isStripeCheckoutSessionId('session_123'), false)
    assert.equal(isStripeCheckoutSessionId('cs_test_a1B2/../x'), false)
  })
})

describe('buildCheckoutSessionParams', () => {
  const product = {
    id: 'prod-uuid',
    slug: 'saas-starter',
    stripe_price_id: 'price_123',
  } as const

  it('creates an invoice and collects tax id without Stripe Tax', () => {
    const params = buildCheckoutSessionParams({
      product: product as never,
      userId: 'user-1',
      userEmail: 'buyer@agency.eu',
      appUrl: 'https://couto.software',
    })

    assert.equal(params.invoice_creation?.enabled, true)
    assert.equal(params.tax_id_collection?.enabled, true)
    assert.equal(params.automatic_tax?.enabled, false)
    assert.equal(params.billing_address_collection, 'required')
  })

  it('saves collected address onto an existing Stripe customer', () => {
    const params = buildCheckoutSessionParams({
      product: product as never,
      userId: 'user-1',
      userEmail: 'buyer@agency.eu',
      appUrl: 'https://couto.software',
      customerId: 'cus_123',
    })

    assert.equal(params.customer, 'cus_123')
    assert.equal(params.customer_update?.address, 'auto')
    assert.equal(params.customer_update?.name, 'auto')
  })
})
