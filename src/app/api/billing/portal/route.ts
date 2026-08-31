import { NextResponse } from 'next/server'

import { env, isStripeConfigured } from '@/lib/env'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  createBillingPortalSession,
  getOrCreateStripeCustomer,
} from '@/server/services/billing'
import { getProfile } from '@/server/services/profiles'

export const runtime = 'nodejs'

export async function POST() {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Billing is not configured yet.' },
        { status: 503 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const profile = await getProfile(service, user.id)
    const customerId = await getOrCreateStripeCustomer(getStripe(), service, {
      userId: user.id,
      email: user.email,
      fullName: profile?.full_name,
      existingCustomerId: profile?.stripe_customer_id,
    })

    const url = await createBillingPortalSession(
      getStripe(),
      customerId,
      `${env.appUrl}/dashboard/billing`,
    )

    if (!url) {
      return NextResponse.json(
        { error: 'Could not open the billing portal.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Billing portal failed:', error)
    return NextResponse.json(
      { error: 'Could not open the billing portal.' },
      { status: 500 },
    )
  }
}
