import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

import { type Database, type Product } from '@/lib/supabase/types'
import { getEntitlement } from '@/server/services/entitlements'
import { fulfillCheckoutSession } from '@/server/services/orders'

export function isStripeCheckoutSessionId(value: string): boolean {
  return /^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(value)
}

export type CheckoutSuccessDownload =
  | {
      status: 'ready'
      productId: string
      productName: string
      remaining: number
    }
  | { status: 'processing' }
  | { status: 'unavailable' }

export async function resolveCheckoutSuccessDownload(
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  params: {
    sessionId: string | undefined
    userId: string
    downloadLimit: number
  },
): Promise<CheckoutSuccessDownload> {
  const sessionId = params.sessionId?.trim()
  if (!sessionId || !isStripeCheckoutSessionId(sessionId)) {
    return { status: 'unavailable' }
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('Checkout success: session retrieve failed', error)
    return { status: 'unavailable' }
  }

  const sessionUserId =
    session.metadata?.userId ?? session.client_reference_id ?? null
  const productId = session.metadata?.productId ?? null

  if (!sessionUserId || sessionUserId !== params.userId || !productId) {
    return { status: 'unavailable' }
  }

  const paid =
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required'

  if (!paid) {
    return { status: 'processing' }
  }

  await fulfillCheckoutSession(supabase, session, params.downloadLimit)

  const entitlement = await getEntitlement(supabase, params.userId, productId)
  if (!entitlement) {
    return { status: 'processing' }
  }

  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', productId)
    .maybeSingle()

  return {
    status: 'ready',
    productId,
    productName: product?.name ?? 'Your product',
    remaining: Math.max(0, entitlement.download_limit - entitlement.download_count),
  }
}

export async function createCheckoutSession(
  stripe: Stripe,
  params: {
    product: Product
    userId: string
    userEmail: string
    appUrl: string
    customerId?: string | null
  },
): Promise<{ url: string | null }> {
  const { product, userId, userEmail, appUrl, customerId } = params

  if (!product.stripe_price_id) {
    throw new Error(`Product "${product.name}" is missing a Stripe price ID`)
  }

  const session = await stripe.checkout.sessions.create(
    buildCheckoutSessionParams({
      product,
      userId,
      userEmail,
      appUrl,
      customerId,
    }),
  )

  return { url: session.url }
}

export function buildCheckoutSessionParams(params: {
  product: Product
  userId: string
  userEmail: string
  appUrl: string
  customerId?: string | null
}): Stripe.Checkout.SessionCreateParams {
  const { product, userId, userEmail, appUrl, customerId } = params

  return {
    mode: 'payment',
    line_items: [{ price: product.stripe_price_id!, quantity: 1 }],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/products/${product.slug}`,
    client_reference_id: userId,
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    // Stripe Tax is not available for BR accounts yet; enabling this
    // makes checkout.sessions.create fail.
    automatic_tax: { enabled: false },
    invoice_creation: { enabled: true },
    ...(customerId
      ? {
          customer: customerId,
          customer_update: {
            address: 'auto',
            name: 'auto',
          },
        }
      : { customer_email: userEmail }),
    metadata: {
      userId,
      productId: product.id,
    },
    payment_intent_data: {
      metadata: {
        userId,
        productId: product.id,
      },
    },
  }
}
