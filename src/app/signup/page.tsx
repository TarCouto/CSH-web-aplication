import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { SignupForm } from '@/components/auth/SignupForm'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { safeRedirectPath } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/env'
import { AFTER_INTRO_Y } from '@/lib/spacing'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create an account to purchase and download products.',
  alternates: { canonical: '/signup' },
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect(safeRedirectPath(redirectTo))
    }
  }

  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login'

  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Create account">
        <p>Sign up to purchase and access digital products.</p>
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <div className="max-w-md">
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>
          <p className="mt-6 text-sm text-neutral-600">
            Already have an account?{' '}
            <Link
              href={loginHref}
              className="font-semibold text-neutral-950 hover:text-neutral-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </Container>
    </RootLayout>
  )
}
