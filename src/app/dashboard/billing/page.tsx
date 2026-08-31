import { type Metadata } from 'next'

import { BillingPortalButton } from '@/components/dashboard/BillingPortalButton'
import { FadeIn } from '@/components/FadeIn'
import { isStripeConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/server/services/profiles'

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage your Stripe customer and payment methods.',
}

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null
  const linked = Boolean(profile?.stripe_customer_id)
  const stripeReady = isStripeConfigured()

  return (
    <FadeIn>
      <header>
        <p className="font-display text-base font-semibold text-neutral-950">
          Billing
        </p>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
          Payment methods
        </h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600">
          Link a Stripe customer to reuse cards on the next checkout and manage
          receipts in the billing portal.
        </p>
      </header>

      <div className="mt-12 rounded-4xl bg-white p-8 ring-1 ring-neutral-950/5 sm:p-10">
        <p className="font-display text-base font-semibold text-neutral-950">
          {linked ? 'Stripe account linked' : 'No Stripe customer yet'}
        </p>
        <p className="mt-3 max-w-xl text-base text-neutral-600">
          {stripeReady
            ? linked
              ? 'Open the portal to update cards, see invoices, or change billing details. Future checkouts reuse this customer automatically.'
              : 'The first time you open billing or complete a purchase, we create a Stripe customer on your profile and keep it for the next checkout.'
            : 'Stripe keys are not configured in this environment yet. You can still buy later; billing management will unlock when Stripe is connected.'}
        </p>
        <div className="mt-8">
          <BillingPortalButton disabled={!stripeReady} />
        </div>
      </div>
    </FadeIn>
  )
}
