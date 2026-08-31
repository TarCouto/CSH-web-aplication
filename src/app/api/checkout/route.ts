import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getOrCreateStripeCustomer } from '@/server/services/billing'
import { createCheckoutSession } from '@/server/services/checkout'
import { getProfile } from '@/server/services/profiles'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('status', 'published')
      .maybeSingle()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const stripe = getStripe()
    const service = createServiceClient()
    const profile = await getProfile(service, user.id)
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
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
