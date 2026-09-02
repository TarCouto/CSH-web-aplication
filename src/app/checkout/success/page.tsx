import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { CheckoutSuccessActions } from '@/components/checkout/CheckoutSuccessActions'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { env, isStripeConfigured } from '@/lib/env'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { AFTER_INTRO_Y } from '@/lib/spacing'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { resolveCheckoutSuccessDownload } from '@/server/services/checkout'

export const metadata: Metadata = {
  title: 'Checkout complete',
  description: 'Your purchase was successful.',
  robots: NO_INDEX_ROBOTS,
}

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams
  const loginRedirect = sessionId
    ? `/login?redirect=${encodeURIComponent(`/checkout/success?session_id=${sessionId}`)}`
    : '/login?redirect=/dashboard'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(loginRedirect)
  }

  const download = isStripeConfigured()
    ? await resolveCheckoutSuccessDownload(
        getStripe(),
        createServiceClient(),
        {
          sessionId,
          userId: user.id,
          downloadLimit: env.downloadLimit,
        },
      )
    : { status: 'unavailable' as const }

  return (
    <RootLayout>
      <PageIntro eyebrow="Checkout" title="Thank you for your purchase">
        <p>
          Your payment was successful. Download your boilerplate below — it
          also stays in your dashboard for later.
        </p>
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <CheckoutSuccessActions download={download} sessionId={sessionId} />
      </Container>
    </RootLayout>
  )
}
