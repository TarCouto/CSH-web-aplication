import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { AFTER_INTRO_Y } from '@/lib/spacing'

export const metadata: Metadata = {
  title: 'Email confirmed',
  description: 'Your Couto Software House account is ready to use.',
  robots: NO_INDEX_ROBOTS,
}

export default function SignupConfirmedPage() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Account" title="Your email is confirmed">
        <p>
          Your account is ready. Sign in with the email and password you used
          when signing up.
        </p>
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <FadeIn className="max-w-lg">
          <ol className="list-decimal space-y-3 pl-5 text-base text-neutral-600">
            <li>Click the button below to open the login page.</li>
            <li>Enter your email and password.</li>
            <li>
              Access your dashboard to browse products and download your
              purchases.
            </li>
          </ol>
          <div className="mt-10">
            <Button href="/login">Log in to your account</Button>
          </div>
        </FadeIn>
      </Container>
    </RootLayout>
  )
}
