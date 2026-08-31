import { Button } from '@/components/Button'
import { DownloadButton } from '@/components/products/DownloadButton'
import { formatPrice } from '@/lib/money'
import { type EntitlementWithProduct } from '@/server/services/entitlements'

export function PurchasedProductsList({
  entitlements,
}: {
  entitlements: EntitlementWithProduct[]
}) {
  if (entitlements.length === 0) {
    return (
      <div className="rounded-4xl bg-neutral-50 px-8 py-12 ring-1 ring-neutral-950/5">
        <p className="font-display text-lg font-semibold text-neutral-950">
          No products yet
        </p>
        <p className="mt-3 max-w-xl text-base text-neutral-600">
          After you buy a boilerplate, it stays here so you can download it
          again whenever you need.
        </p>
        <div className="mt-8">
          <Button href="/products">Browse the store</Button>
        </div>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-neutral-950/5 overflow-hidden rounded-4xl ring-1 ring-neutral-950/5">
      {entitlements.map((entitlement) => {
        const remaining =
          entitlement.download_limit - entitlement.download_count
        const limitReached = remaining <= 0
        const progress =
          entitlement.download_limit > 0
            ? Math.min(
                (entitlement.download_count / entitlement.download_limit) * 100,
                100,
              )
            : 0

        return (
          <li
            key={entitlement.id}
            className="grid gap-6 bg-white p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8"
          >
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-neutral-950">
                {entitlement.product.name}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {formatPrice(
                  entitlement.product.price_cents,
                  entitlement.product.currency,
                )}
                {' · '}
                {entitlement.download_count}/{entitlement.download_limit}{' '}
                downloads
              </p>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-950"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <DownloadButton
              productId={entitlement.product_id}
              disabled={limitReached}
              remaining={limitReached ? undefined : remaining}
            />
          </li>
        )
      })}
    </ul>
  )
}
