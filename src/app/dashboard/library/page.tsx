import { type Metadata } from 'next'

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { PurchasedProductsList } from '@/components/dashboard/PurchasedProductsList'
import { FadeIn } from '@/components/FadeIn'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { createClient } from '@/lib/supabase/server'
import { listUserEntitlements } from '@/server/services/entitlements'

export const metadata: Metadata = {
  title: 'My products',
  description: 'Download the boilerplates you purchased.',
  robots: NO_INDEX_ROBOTS,
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
    <FadeIn className="pt-4 lg:pt-0">
      <DashboardPageHeader
        eyebrow="Library"
        title="My products"
        description="Every boilerplate you bought lives here. Download it again whenever you want, up to your allowance."
      />

      <div className="mt-8 sm:mt-12">
        <PurchasedProductsList entitlements={entitlements} />
      </div>
    </FadeIn>
  )
}
