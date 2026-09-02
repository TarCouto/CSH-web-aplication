import { type Metadata } from 'next'

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { FadeIn } from '@/components/FadeIn'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/server/services/profiles'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Update your account profile.',
  robots: NO_INDEX_ROBOTS,
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  return (
    <FadeIn className="pt-4 lg:pt-0">
      <DashboardPageHeader
        eyebrow="Account"
        title="Profile"
        description="Your name is stored in your profile. Email comes from your login and cannot be changed here."
      />

      <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-neutral-950/5 sm:mt-12 sm:rounded-4xl sm:p-8 lg:p-10">
        {user && (
          <ProfileForm
            userId={user.id}
            email={user.email ?? profile?.email ?? ''}
            fullName={profile?.full_name ?? ''}
          />
        )}
      </div>
    </FadeIn>
  )
}
