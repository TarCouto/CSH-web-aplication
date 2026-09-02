import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

import { buildPurchaseEmailHtml, sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { formatPrice } from '@/lib/money'
import { type Database, type Order, type Product } from '@/lib/supabase/types'

export type OrderWithProduct = Order & {
  product: Pick<Product, 'id' | 'slug' | 'name'>
}

export async function listUserOrders(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<OrderWithProduct[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products(id, slug, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as OrderWithProduct[]
}

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

function isCheckoutFulfilled(session: Stripe.Checkout.Session): boolean {
  return (
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required'
  )
}

async function ensureEntitlement(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
  orderId: string,
  downloadLimit: number,
): Promise<void> {
  const { error: entitlementError } = await supabase.from('entitlements').upsert(
    {
      user_id: userId,
      product_id: productId,
      order_id: orderId,
      download_limit: downloadLimit,
      download_count: 0,
    },
    { onConflict: 'user_id,product_id', ignoreDuplicates: true },
  )

  if (entitlementError) {
    throw entitlementError
  }
}

async function sendPurchaseEmail(
  supabase: SupabaseClient<Database>,
  session: Stripe.Checkout.Session,
  productId: string,
): Promise<void> {
  const buyerEmail = session.customer_details?.email

  if (!buyerEmail) return

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

export async function fulfillCheckoutSession(
  supabase: SupabaseClient<Database>,
  session: Stripe.Checkout.Session,
  downloadLimit: number,
): Promise<void> {
  if (!isCheckoutFulfilled(session)) {
    console.error(
      'Skipping checkout fulfillment: payment not completed',
      {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      },
    )
    return
  }

  const userId =
    session.metadata?.userId ?? session.client_reference_id ?? null
  const productId = session.metadata?.productId ?? null

  if (!userId || !productId) {
    console.error('Checkout session missing required metadata', {
      sessionId: session.id,
      userId: userId ?? undefined,
      productId: productId ?? undefined,
    })
    return
  }

  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle()

  if (existingOrder) {
    const { data: existingEntitlement } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (existingEntitlement) return

    await ensureEntitlement(
      supabase,
      userId,
      productId,
      existingOrder.id,
      downloadLimit,
    )
    await sendPurchaseEmail(supabase, session, productId)
    return
  }

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

  await ensureEntitlement(
    supabase,
    userId,
    productId,
    order.id,
    downloadLimit,
  )

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

  if (customerId) {
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId)
  }

  await sendPurchaseEmail(supabase, session, productId)
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

export async function handleRefund(
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  charge: Stripe.Charge,
  options?: { skipPartialCheck?: boolean },
): Promise<void> {
  if (
    !options?.skipPartialCheck &&
    charge.amount_refunded < charge.amount
  ) {
    console.error('handleRefund: partial refund — entitlement preserved', {
      chargeId: charge.id,
      amount: charge.amount,
      amountRefunded: charge.amount_refunded,
    })
    return
  }

  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null)

  if (!paymentIntentId) {
    console.error('handleRefund: charge missing payment_intent', {
      chargeId: charge.id,
    })
    return
  }

  let userId: string
  let productId: string
  let orderId: string

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, product_id, status')
    .eq('stripe_payment_intent', paymentIntentId)
    .maybeSingle()

  if (order) {
    if (order.status === 'refunded') return

    orderId = order.id
    userId = order.user_id
    productId = order.product_id
  } else {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const metadataUserId = paymentIntent.metadata?.userId
    const metadataProductId = paymentIntent.metadata?.productId

    if (!metadataUserId || !metadataProductId) {
      console.error('handleRefund: order not found and metadata missing', {
        chargeId: charge.id,
        paymentIntentId,
      })
      return
    }

    const { data: orderByMeta } = await supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', metadataUserId)
      .eq('product_id', metadataProductId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!orderByMeta) {
      console.error('handleRefund: no matching paid order', {
        chargeId: charge.id,
        userId: metadataUserId,
        productId: metadataProductId,
      })
      return
    }

    orderId = orderByMeta.id
    userId = metadataUserId
    productId = metadataProductId
  }

  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', orderId)

  if (orderUpdateError) throw orderUpdateError

  const { error: entitlementDeleteError } = await supabase
    .from('entitlements')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (entitlementDeleteError) throw entitlementDeleteError
}
