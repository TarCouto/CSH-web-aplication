import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { createClient } from '@/lib/supabase/server'
import { listUserEntitlements } from '@/server/services/entitlements'

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
