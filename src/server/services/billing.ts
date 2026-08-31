import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

import { type Database } from '@/lib/supabase/types'

export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  params: {
    userId: string
    email: string
    fullName?: string | null
    existingCustomerId?: string | null
  },
): Promise<string> {
  if (params.existingCustomerId) {
    return params.existingCustomerId
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', params.userId)
    .maybeSingle()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.fullName ?? undefined,
    metadata: { userId: params.userId },
  })

  const { error } = await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', params.userId)

  if (error) {
    throw error
  }

  return customer.id
}

export async function createBillingPortalSession(
  stripe: Stripe,
  customerId: string,
  returnUrl: string,
): Promise<string | null> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}
