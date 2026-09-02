import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

import type { Database } from '@/lib/supabase/types'

import { fulfillCheckoutSession, handleRefund } from './orders'

type FakeSupabaseOptions = {
  existingOrder?: { id: string } | null
  existingEntitlement?: { id: string } | null
  orderInsert?: {
    data: { id: string } | null
    error: { message: string } | null
  }
  entitlementError?: { message: string } | null
}

function createFakeSupabase(options: FakeSupabaseOptions = {}) {
  const calls = {
    orderInsert: 0,
    entitlementUpsert: 0,
  }

  const client = {
    calls,
    from(table: string) {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: options.existingOrder ?? null,
                error: null,
              }),
            }),
          }),
          insert: () => {
            calls.orderInsert += 1
            return {
              select: () => ({
                single: async () =>
                  options.orderInsert ?? {
                    data: { id: 'order-new' },
                    error: null,
                  },
              }),
            }
          },
        }
      }

      if (table === 'entitlements') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: options.existingEntitlement ?? null,
                  error: null,
                }),
              }),
            }),
          }),
          upsert: async () => {
            calls.entitlementUpsert += 1
            return { error: options.entitlementError ?? null }
          },
        }
      }

      if (table === 'profiles') {
        return {
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        }
      }

      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { name: 'Test Product', slug: 'test-product' },
                error: null,
              }),
            }),
          }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    },
  } as unknown as SupabaseClient<Database> & {
    calls: typeof calls
  }

  return client
}

function baseSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: 'cs_test_123',
    object: 'checkout.session',
    payment_status: 'paid',
    metadata: {
      userId: 'user-1',
      productId: 'product-1',
    },
    amount_total: 1000,
    currency: 'usd',
    payment_intent: 'pi_123',
    customer_details: {
      email: 'buyer@example.com',
    },
    customer: 'cus_123',
    ...overrides,
  } as Stripe.Checkout.Session
}

describe('fulfillCheckoutSession', () => {
  const smtpEnvKeys = [
    'ZOHO_SMTP_USER',
    'ZOHO_SMTP_PASSWORD',
    'ZOHO_SMTP_HOST',
    'ZOHO_SMTP_PORT',
  ] as const

  const savedSmtpEnv = new Map<string, string | undefined>()

  beforeEach(() => {
    for (const key of smtpEnvKeys) {
      savedSmtpEnv.set(key, process.env[key])
      delete process.env[key]
    }
  })

  afterEach(() => {
    for (const key of smtpEnvKeys) {
      const value = savedSmtpEnv.get(key)
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  })

  it('no-ops when the checkout session was already fulfilled', async () => {
    const supabase = createFakeSupabase({
      existingOrder: { id: 'order-existing' },
      existingEntitlement: { id: 'entitlement-existing' },
    })

    await fulfillCheckoutSession(supabase, baseSession(), 5)

    assert.equal(supabase.calls.orderInsert, 0)
    assert.equal(supabase.calls.entitlementUpsert, 0)
  })

  it('retries entitlement when order exists but entitlement is missing', async () => {
    const supabase = createFakeSupabase({
      existingOrder: { id: 'order-existing' },
      existingEntitlement: null,
    })

    await fulfillCheckoutSession(supabase, baseSession(), 5)

    assert.equal(supabase.calls.orderInsert, 0)
    assert.equal(supabase.calls.entitlementUpsert, 1)
  })

  it('fulfills free checkout with no_payment_required', async () => {
    const supabase = createFakeSupabase()

    await fulfillCheckoutSession(
      supabase,
      baseSession({
        payment_status: 'no_payment_required',
        amount_total: 0,
      }),
      5,
    )

    assert.equal(supabase.calls.orderInsert, 1)
    assert.equal(supabase.calls.entitlementUpsert, 1)
  })

  it('no-ops and logs when required metadata is missing', async () => {
    const supabase = createFakeSupabase()
    const errorSpy = (() => {
      const original = console.error
      const calls: unknown[][] = []
      console.error = (...args: unknown[]) => {
        calls.push(args)
      }
      return {
        calls,
        restore() {
          console.error = original
        },
      }
    })()

    await fulfillCheckoutSession(
      supabase,
      baseSession({ metadata: {} }),
      5,
    )

    assert.equal(supabase.calls.orderInsert, 0)
    assert.match(
      String(errorSpy.calls[0]?.[0]),
      /missing required metadata/i,
    )

    errorSpy.restore()
  })

  it('no-ops when payment_status is not paid', async () => {
    const supabase = createFakeSupabase()
    const errorSpy = (() => {
      const original = console.error
      const calls: unknown[][] = []
      console.error = (...args: unknown[]) => {
        calls.push(args)
      }
      return {
        calls,
        restore() {
          console.error = original
        },
      }
    })()

    await fulfillCheckoutSession(
      supabase,
      baseSession({ payment_status: 'unpaid' }),
      5,
    )

    assert.equal(supabase.calls.orderInsert, 0)
    assert.match(
      String(errorSpy.calls[0]?.[0]),
      /payment not completed/i,
    )

    errorSpy.restore()
  })

  it('throws when order insert fails', async () => {
    const supabase = createFakeSupabase({
      orderInsert: {
        data: null,
        error: { message: 'insert failed' },
      },
    })

    await assert.rejects(
      () => fulfillCheckoutSession(supabase, baseSession(), 5),
      (error: unknown) => {
        assert.ok(error instanceof Error || typeof error === 'object')
        return true
      },
    )
  })

  it('does not fail fulfillment when purchase email sending fails', async () => {
    const supabase = createFakeSupabase()
    const errorSpy = (() => {
      const original = console.error
      const calls: unknown[][] = []
      console.error = (...args: unknown[]) => {
        calls.push(args)
      }
      return {
        calls,
        restore() {
          console.error = original
        },
      }
    })()

    await assert.doesNotReject(() =>
      fulfillCheckoutSession(supabase, baseSession(), 5),
    )

    assert.equal(supabase.calls.orderInsert, 1)
    assert.equal(supabase.calls.entitlementUpsert, 1)
    assert.match(
      String(errorSpy.calls.at(-1)?.[0]),
      /confirmation email failed/i,
    )

    errorSpy.restore()
  })
})

type FakeRefundSupabaseOptions = {
  order?: {
    id: string
    user_id: string
    product_id: string
    status: string
  } | null
}

function createFakeRefundSupabase(options: FakeRefundSupabaseOptions = {}) {
  const calls = {
    orderUpdate: 0,
    entitlementDelete: 0,
  }

  const client = {
    calls,
    from(table: string) {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: options.order ?? null,
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: async () => {
              calls.orderUpdate += 1
              return { error: null }
            },
          }),
        }
      }

      if (table === 'entitlements') {
        return {
          delete: () => ({
            eq: () => ({
              eq: async () => {
                calls.entitlementDelete += 1
                return { error: null }
              },
            }),
          }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    },
  } as unknown as SupabaseClient<Database> & {
    calls: typeof calls
  }

  return client
}

function baseCharge(overrides: Partial<Stripe.Charge> = {}): Stripe.Charge {
  return {
    id: 'ch_test_123',
    object: 'charge',
    amount: 9900,
    amount_refunded: 9900,
    payment_intent: 'pi_123',
    ...overrides,
  } as Stripe.Charge
}

const fakeStripe = {
  paymentIntents: {
    retrieve: async () => {
      throw new Error('paymentIntents.retrieve should not be called')
    },
  },
} as unknown as Stripe

describe('handleRefund', () => {
  const paidOrder = {
    id: 'order-1',
    user_id: 'user-1',
    product_id: 'product-1',
    status: 'paid',
  }

  it('marks the order refunded and deletes the entitlement on a full refund', async () => {
    const supabase = createFakeRefundSupabase({ order: paidOrder })

    await handleRefund(fakeStripe, supabase, baseCharge())

    assert.equal(supabase.calls.orderUpdate, 1)
    assert.equal(supabase.calls.entitlementDelete, 1)
  })

  it('preserves the entitlement on a partial refund', async () => {
    const supabase = createFakeRefundSupabase({ order: paidOrder })

    await handleRefund(
      fakeStripe,
      supabase,
      baseCharge({ amount_refunded: 500 }),
    )

    assert.equal(supabase.calls.orderUpdate, 0)
    assert.equal(supabase.calls.entitlementDelete, 0)
  })

  it('revokes the entitlement on a dispute even when nothing was refunded', async () => {
    const supabase = createFakeRefundSupabase({ order: paidOrder })

    await handleRefund(
      fakeStripe,
      supabase,
      baseCharge({ amount_refunded: 0 }),
      { skipPartialCheck: true },
    )

    assert.equal(supabase.calls.orderUpdate, 1)
    assert.equal(supabase.calls.entitlementDelete, 1)
  })

  it('no-ops when the order is already refunded', async () => {
    const supabase = createFakeRefundSupabase({
      order: { ...paidOrder, status: 'refunded' },
    })

    await handleRefund(fakeStripe, supabase, baseCharge())

    assert.equal(supabase.calls.orderUpdate, 0)
    assert.equal(supabase.calls.entitlementDelete, 0)
  })
})
