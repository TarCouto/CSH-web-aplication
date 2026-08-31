import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

import { buildPurchaseEmailHtml, sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { formatPrice } from '@/lib/money'
import { type Database } from '@/lib/supabase/types'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(
  supabase: SupabaseClient<Database>,
  base: string,
): Promise<string> {
  let slug = slugify(base) || 'product'
  let suffix = 0

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) return candidate
    suffix += 1
  }
}

export async function fulfillCheckoutSession(
  supabase: SupabaseClient<Database>,
  session: Stripe.Checkout.Session,
  downloadLimit: number,
): Promise<void> {
  const userId =
    session.metadata?.userId ?? session.client_reference_id ?? null
  const productId = session.metadata?.productId ?? null

  if (!userId || !productId) return

  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existing) return

  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : null

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      product_id: productId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent: paymentIntent,
      amount_cents: session.amount_total,
      currency: session.currency,
      status: 'paid',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    throw orderError ?? new Error('Failed to create order')
  }

  const { error: entitlementError } = await supabase.from('entitlements').upsert(
    {
      user_id: userId,
      product_id: productId,
      order_id: order.id,
      download_limit: downloadLimit,
      download_count: 0,
    },
    { onConflict: 'user_id,product_id', ignoreDuplicates: true },
  )

  if (entitlementError) {
    throw entitlementError
  }

  const buyerEmail = session.customer_details?.email

  if (buyerEmail) {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('name, slug')
        .eq('id', productId)
        .maybeSingle()

      const productName = product?.name ?? 'Your product'
      const amountLabel = formatPrice(
        session.amount_total ?? 0,
        session.currency ?? 'usd',
      )
      const dashboardUrl = `${env.appUrl}/dashboard`
      const html = buildPurchaseEmailHtml({
        productName,
        amountLabel,
        dashboardUrl,
      })

      await sendEmail({
        to: buyerEmail,
        subject: `Your purchase: ${productName}`,
        html,
      })
    } catch (error) {
      console.error('Purchase confirmation email failed:', error)
    }
  }
}

export async function syncStripeProduct(
  supabase: SupabaseClient<Database>,
  product: Stripe.Product,
): Promise<void> {
  const { data: existing } = await supabase
    .from('products')
    .select('id, description')
    .eq('stripe_product_id', product.id)
    .maybeSingle()

  const coverImage = product.images?.[0] ?? null

  if (existing) {
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description ?? existing.description,
        cover_image: coverImage,
      })
      .eq('stripe_product_id', product.id)

    if (error) throw error
    return
  }

  const slug = await uniqueSlug(supabase, product.name)

  const { error } = await supabase.from('products').insert({
    slug,
    name: product.name,
    description: product.description ?? null,
    cover_image: coverImage,
    stripe_product_id: product.id,
    status: 'draft',
  })

  if (error) throw error
}

export async function syncStripePrice(
  supabase: SupabaseClient<Database>,
  price: Stripe.Price,
): Promise<void> {
  const stripeProductId =
    typeof price.product === 'string' ? price.product : price.product.id

  const { error } = await supabase
    .from('products')
    .update({
      price_cents: price.unit_amount ?? 0,
      currency: price.currency,
      stripe_price_id: price.id,
    })
    .eq('stripe_product_id', stripeProductId)

  if (error) throw error
}
