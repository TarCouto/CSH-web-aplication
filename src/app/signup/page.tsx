import { type Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { SignupForm } from '@/components/auth/SignupForm'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'

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
  const { redirect } = await searchParams
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : '/login'

  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Create account">
        <p>Sign up to purchase and access digital products.</p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
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
