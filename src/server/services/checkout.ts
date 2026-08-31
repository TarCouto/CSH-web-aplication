import type Stripe from 'stripe'

import { type Product } from '@/lib/supabase/types'

export async function createCheckoutSession(
  stripe: Stripe,
  params: {
    product: Product
    userId: string
    userEmail: string
    appUrl: string
  },
): Promise<{ url: string | null }> {
  const { product, userId, userEmail, appUrl } = params

  if (!product.stripe_price_id) {
    throw new Error(`Product "${product.name}" is missing a Stripe price ID`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: product.stripe_price_id, quantity: 1 }],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/products/${product.slug}`,
    customer_email: userEmail,
    client_reference_id: userId,
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
  })

  return { url: session.url }
}
