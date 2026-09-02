import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import {
  crossOriginResponse,
  isSameOrigin,
  TEN_MINUTES_MS,
  tooManyRequestsResponse,
} from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isValidUuid } from '@/lib/validation'
import { getOrCreateStripeCustomer } from '@/server/services/billing'
import { createCheckoutSession } from '@/server/services/checkout'
import { getPublishedProductForCheckout } from '@/server/services/products'
import { getProfile } from '@/server/services/profiles'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return crossOriginResponse()
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = await rateLimit(`checkout:${user.id}`, {
      limit: 10,
      windowMs: TEN_MINUTES_MS,
    })

    if (!limit.allowed) {
      return tooManyRequestsResponse(limit)
    }

    const body = await request.json()
    const { productId } = body

    if (!productId || typeof productId !== 'string' || !isValidUuid(productId)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const service = createServiceClient()
    const product = await getPublishedProductForCheckout(service, productId)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const stripe = getStripe()
    const profile = await getProfile(supabase, user.id)
    const customerId = user.email
      ? await getOrCreateStripeCustomer(stripe, service, {
          userId: user.id,
          email: user.email,
          fullName: profile?.full_name,
          existingCustomerId: profile?.stripe_customer_id,
        })
      : null

    const { url } = await createCheckoutSession(stripe, {
      product,
      userId: user.id,
      userEmail: user.email!,
      appUrl: env.appUrl,
      customerId,
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout failed:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
