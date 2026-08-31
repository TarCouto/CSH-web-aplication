import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import { StatList, StatListItem } from '@/components/StatList'
import { type EntitlementWithProduct } from '@/server/services/entitlements'

export function DashboardOverview({
  entitlements,
}: {
  entitlements: EntitlementWithProduct[]
}) {
  const productCount = entitlements.length
  const downloadsUsed = entitlements.reduce(
    (total, item) => total + item.download_count,
    0,
  )
  const downloadsRemaining = entitlements.reduce((total, item) => {
    return total + Math.max(item.download_limit - item.download_count, 0)
  }, 0)

  return (
    <FadeIn>
      <header>
        <p className="font-display text-base font-semibold text-neutral-950">
          Dashboard
        </p>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
          Overview
        </h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600">
          Your purchased boilerplates, download allowance, and account activity
          in one place.
        </p>
      </header>

      <div className="mt-12 rounded-4xl bg-white p-8 ring-1 ring-neutral-950/5 sm:p-10">
        <StatList>
          <StatListItem label="Products owned" value={String(productCount)} />
          <StatListItem
            label="Downloads remaining"
            value={String(downloadsRemaining)}
          />
          <StatListItem label="Downloads used" value={String(downloadsUsed)} />
        </StatList>
      </div>

      <section className="mt-16 sm:mt-20 rounded-4xl bg-neutral-50 px-8 py-10 ring-1 ring-neutral-950/5">
        <h2 className="font-display text-base font-semibold text-neutral-950">
          My products
        </h2>
        <p className="mt-3 max-w-xl text-base text-neutral-600">
          {productCount === 0
            ? 'You have not purchased a boilerplate yet. The store is the next step.'
            : `You have ${productCount} product${productCount === 1 ? '' : 's'} ready to download.`}
        </p>
        <div className="mt-8">
          <Button href={productCount === 0 ? '/products' : '/dashboard/library'}>
            {productCount === 0 ? 'Browse the store' : 'Open my products'}
          </Button>
        </div>
      </section>
    </FadeIn>
  )
}
