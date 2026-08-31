import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'

export default function CheckoutCancelPage() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Checkout" title="Checkout canceled">
        <p>
          Your checkout was canceled. No charges were made. You can return to
          the store and try again whenever you are ready.
        </p>
      </PageIntro>

      <Container className="mt-16">
        <Button href="/products">Back to store</Button>
      </Container>
    </RootLayout>
  )
}
