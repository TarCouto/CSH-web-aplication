import { type Metadata } from 'next'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'

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
  await searchParams

  return (
    <RootLayout>
      <PageIntro eyebrow="Checkout" title="Thank you for your purchase">
        <p>
          Your payment was successful. The product is now available in your
          dashboard and ready to download.
        </p>
      </PageIntro>

      <Container className="mt-16">
        <Button href="/dashboard">Go to your products</Button>
      </Container>
    </RootLayout>
  )
}
