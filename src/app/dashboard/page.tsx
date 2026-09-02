import { type Metadata } from 'next'

import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { createClient } from '@/lib/supabase/server'
import { listUserEntitlements } from '@/server/services/entitlements'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your account overview and purchased products.',
  robots: NO_INDEX_ROBOTS,
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const entitlements = user
    ? await listUserEntitlements(supabase, user.id)
    : []

  return <DashboardOverview entitlements={entitlements} />
}
