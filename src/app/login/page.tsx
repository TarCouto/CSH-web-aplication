import { type Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { LoginForm } from '@/components/auth/LoginForm'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'

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
  const { redirect } = await searchParams
  const signupHref = redirect
    ? `/signup?redirect=${encodeURIComponent(redirect)}`
    : '/signup'

  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Log in">
        <p>Sign in to access your purchased products.</p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
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
