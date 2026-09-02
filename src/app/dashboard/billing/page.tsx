import { type Metadata } from 'next'

import { BillingPortalButton } from '@/components/dashboard/BillingPortalButton'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { FadeIn } from '@/components/FadeIn'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { isStripeConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/server/services/profiles'

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage your Stripe customer and payment methods.',
  robots: NO_INDEX_ROBOTS,
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
    <FadeIn className="pt-4 lg:pt-0">
      <DashboardPageHeader
        eyebrow="Billing"
        title="Payment methods"
        description="Link a Stripe customer to reuse cards on the next checkout and manage receipts in the billing portal."
      />

      <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-neutral-950/5 sm:mt-12 sm:rounded-4xl sm:p-8 lg:p-10">
        <p className="font-display text-base font-semibold text-neutral-950">
          {linked ? 'Stripe account linked' : 'No Stripe customer yet'}
        </p>
        <p className="mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
          {stripeReady
            ? linked
              ? 'Open the portal to update cards, see invoices, or change billing details. Future checkouts reuse this customer automatically.'
              : 'The first time you open billing or complete a purchase, we create a Stripe customer on your profile and keep it for the next checkout.'
            : 'Stripe keys are not configured in this environment yet. You can still buy later; billing management will unlock when Stripe is connected.'}
        </p>
        <div className="mt-6 sm:mt-8">
          <BillingPortalButton disabled={!stripeReady} />
        </div>
      </div>
    </FadeIn>
  )
}
