import { type Metadata } from 'next'

import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { FadeIn } from '@/components/FadeIn'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/server/services/profiles'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Update your account profile.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  return (
    <FadeIn>
      <header>
        <p className="font-display text-base font-semibold text-neutral-950">
          Account
        </p>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
          Profile
        </h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600">
          Your name is stored in your profile. Email comes from your login and
          cannot be changed here.
        </p>
      </header>

      <div className="mt-12 rounded-4xl bg-white p-8 ring-1 ring-neutral-950/5 sm:p-10">
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
