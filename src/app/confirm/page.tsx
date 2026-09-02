import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { ConfirmEmailButton } from '@/components/auth/ConfirmEmailButton'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { parseOtpType, parseTokenHash } from '@/lib/verify-email-otp'

export const metadata: Metadata = {
  title: 'Confirm your email',
  description: 'Confirm your Couto Software House account.',
  robots: NO_INDEX_ROBOTS,
}

type ConfirmPageProps = {
  searchParams: Promise<{
    token_hash?: string
    type?: string
    next?: string
  }>
}

export default async function EmailConfirmPage({
  searchParams,
}: ConfirmPageProps) {
  const params = await searchParams
  const tokenHash = parseTokenHash(params.token_hash ?? null)
  const type = parseOtpType(params.type ?? null)

  if (!tokenHash || !type) {
    redirect('/login?error=confirm_failed')
  }

  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Confirm your request">
        <p>
          Click the button below to continue. This extra step keeps automated
          email scanners from using your link before you do.
        </p>
      </PageIntro>

      <Container className="mt-16 sm:mt-24">
        <Suspense fallback={null}>
          <ConfirmEmailButton
            failurePath="/login?error=confirm_failed"
            defaultRedirect="/dashboard"
          />
        </Suspense>
      </Container>
    </RootLayout>
  )
}
