import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'

export const metadata: Metadata = {
  title: 'Confirmation failed',
  description: 'We could not confirm your email address.',
  robots: NO_INDEX_ROBOTS,
}

export default function SignupConfirmFailedPage() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="We could not confirm your email">
        <p>
          Something went wrong while confirming your account. The link may have
          expired or already been used.
        </p>
      </PageIntro>

      <Container className="mt-16 sm:mt-24">
        <FadeIn className="max-w-lg">
          <p className="text-base text-neutral-600" role="alert">
            Please wait a few minutes and try signing up again. If the problem
            continues, contact us and we will help you.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/signup">Try signing up again</Button>
            <Button href="/contact" invert>
              Contact support
            </Button>
          </div>
        </FadeIn>
      </Container>
    </RootLayout>
  )
}
