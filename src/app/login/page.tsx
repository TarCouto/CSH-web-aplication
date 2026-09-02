import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { LoginForm } from '@/components/auth/LoginForm'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { safeRedirectPath } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/env'
import { AFTER_INTRO_Y } from '@/lib/spacing'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in to your account to access purchased products.',
  alternates: { canonical: '/login' },
}

export default async function LoginPage({
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

  const signupHref = redirectTo
    ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
    : '/signup'

  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Log in">
        <p>Sign in to access your purchased products.</p>
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <div className="max-w-md">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link
              href={signupHref}
              className="font-semibold text-neutral-950 hover:text-neutral-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Container>
    </RootLayout>
  )
}
