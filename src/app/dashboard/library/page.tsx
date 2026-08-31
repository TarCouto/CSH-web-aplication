import { type Metadata } from 'next'

import { PurchasedProductsList } from '@/components/dashboard/PurchasedProductsList'
import { FadeIn } from '@/components/FadeIn'
import { createClient } from '@/lib/supabase/server'
import { listUserEntitlements } from '@/server/services/entitlements'

export const metadata: Metadata = {
  title: 'My products',
  description: 'Download the boilerplates you purchased.',
}

export default async function LibraryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const entitlements = user
    ? await listUserEntitlements(supabase, user.id)
    : []

  return (
    <FadeIn>
      <header>
        <p className="font-display text-base font-semibold text-neutral-950">
          Library
        </p>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
          My products
        </h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600">
          Every boilerplate you bought lives here. Download it again whenever
          you want, up to your allowance.
        </p>
      </header>

      <div className="mt-12">
        <PurchasedProductsList entitlements={entitlements} />
      </div>
    </FadeIn>
  )
}
