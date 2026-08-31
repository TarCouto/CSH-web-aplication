import { type Metadata } from 'next'

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
    <FadeIn>
      <header>
        <p className="font-display text-base font-semibold text-neutral-950">
          Billing
        </p>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
          Purchases
        </h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600">
          What you bought, when you bought it, and how much you paid — one row
          per checkout.
        </p>
      </header>

      <div className="mt-12">
        <PurchasesTable orders={orders} />
      </div>
    </FadeIn>
  )
}
