import { redirect } from 'next/navigation'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { RootLayout } from '@/components/RootLayout'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  return (
    <RootLayout>
      <DashboardShell email={user.email ?? ''}>
        {children}
      </DashboardShell>
    </RootLayout>
  )
}
