import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import {
  fulfillCheckoutSession,
  handleRefund,
  syncStripePrice,
  syncStripeProduct,
} from '@/server/services/orders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      env.stripe.webhookSecret,
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createServiceClient()

  const stripe = getStripe()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillCheckoutSession(
          service,
          event.data.object,
          env.downloadLimit,
        )
        break
      case 'charge.refunded':
        await handleRefund(stripe, service, event.data.object)
        break
      case 'charge.dispute.created': {
        const dispute = event.data.object
        const chargeId =
          typeof dispute.charge === 'string'
            ? dispute.charge
            : dispute.charge?.id

        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId)
          await handleRefund(stripe, service, charge, {
            skipPartialCheck: true,
          })
        } else {
          console.error(
            `Stripe webhook: dispute ${dispute.id} missing charge reference`,
          )
        }
        break
      }
      case 'product.created':
      case 'product.updated':
        await syncStripeProduct(service, event.data.object)
        break
      case 'price.created':
      case 'price.updated':
        await syncStripePrice(service, event.data.object)
        break
    }
  } catch (error) {
    console.error(
      `Stripe webhook handler failed for ${event.id} ${event.type}:`,
      error,
    )
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
