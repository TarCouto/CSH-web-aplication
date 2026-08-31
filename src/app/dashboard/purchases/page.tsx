import { type Metadata } from 'next'

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { PurchasesTable } from '@/components/dashboard/PurchasesTable'
import { FadeIn } from '@/components/FadeIn'
import { createClient } from '@/lib/supabase/server'
import { listUserOrders } from '@/server/services/orders'

export const metadata: Metadata = {
  title: 'Purchases',
  description: 'Your boilerplate purchase history.',
}

export default async function PurchasesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const orders = user ? await listUserOrders(supabase, user.id) : []

  return (
    <FadeIn className="pt-4 lg:pt-0">
      <DashboardPageHeader
        eyebrow="Billing"
        title="Purchases"
        description="What you bought, when you bought it, and how much you paid — one row per checkout."
      />

      <div className="mt-8 sm:mt-12">
        <PurchasesTable orders={orders} />
      </div>
    </FadeIn>
  )
}
