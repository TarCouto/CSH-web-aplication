import { Button } from '@/components/Button'
import { CheckoutSuccessPreparing } from '@/components/checkout/CheckoutSuccessPreparing'
import { FadeIn } from '@/components/FadeIn'
import { DownloadButton } from '@/components/products/DownloadButton'
import { type CheckoutSuccessDownload } from '@/server/services/checkout'

export function CheckoutSuccessActions({
  download,
  sessionId,
}: {
  download: CheckoutSuccessDownload
  sessionId?: string
}) {
  if (download.status === 'ready') {
    return (
      <FadeIn className="max-w-lg">
        <p className="text-base text-neutral-600">
          {download.productName} is ready. Download the zip now, or find it
          later in your dashboard.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <DownloadButton
            productId={download.productId}
            disabled={download.remaining <= 0}
            remaining={download.remaining <= 0 ? undefined : download.remaining}
          />
          <Button href="/dashboard" invert>
            Go to your products
          </Button>
        </div>
      </FadeIn>
    )
  }

  if (download.status === 'processing') {
    return (
      <FadeIn className="max-w-lg">
        <CheckoutSuccessPreparing sessionId={sessionId} />
        <div className="mt-10">
          <Button href="/dashboard">Go to your products</Button>
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn className="max-w-lg">
      <p className="text-base text-neutral-600">
        Your purchase is in your dashboard when it is ready to download.
      </p>
      <div className="mt-10">
        <Button href="/dashboard">Go to your products</Button>
      </div>
    </FadeIn>
  )
}
