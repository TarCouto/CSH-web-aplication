import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { ConfirmEmailButton } from '@/components/auth/ConfirmEmailButton'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { AFTER_INTRO_Y } from '@/lib/spacing'
import { parseOtpType, parseTokenHash } from '@/lib/verify-email-otp'

export const metadata: Metadata = {
  title: 'Confirm your email',
  description: 'Confirm your Couto Software House account email address.',
  robots: NO_INDEX_ROBOTS,
}

type ConfirmPageProps = {
  searchParams: Promise<{
    token_hash?: string
    type?: string
    next?: string
  }>
}

export default async function SignupConfirmPage({
  searchParams,
}: ConfirmPageProps) {
  const params = await searchParams
  const tokenHash = parseTokenHash(params.token_hash ?? null)
  const type = parseOtpType(params.type ?? null)

  if (!tokenHash || !type) {
    redirect('/signup/confirm-failed')
  }

  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Confirm your email">
        <p>
          You are one step away from activating your account. Confirm your
          email address to continue.
        </p>
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <Suspense fallback={null}>
          <ConfirmEmailButton />
        </Suspense>
      </Container>
    </RootLayout>
  )
}
