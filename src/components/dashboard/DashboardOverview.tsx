import { Button } from '@/components/Button'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
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
    <FadeIn className="pt-4 lg:pt-0">
      <DashboardPageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Your purchased boilerplates, download allowance, and account activity in one place."
      />

      <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-neutral-950/5 sm:mt-12 sm:rounded-4xl sm:p-8 lg:p-10">
        <StatList>
          <StatListItem label="Products owned" value={String(productCount)} />
          <StatListItem
            label="Downloads remaining"
            value={String(downloadsRemaining)}
          />
          <StatListItem label="Downloads used" value={String(downloadsUsed)} />
        </StatList>
      </div>

      <section className="mt-8 rounded-3xl bg-neutral-50 px-5 py-8 ring-1 ring-neutral-950/5 sm:mt-12 sm:rounded-4xl sm:px-8 sm:py-10 lg:mt-16">
        <h2 className="font-display text-base font-semibold text-neutral-950">
          My products
        </h2>
        <p className="mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
          {productCount === 0
            ? 'You have not purchased a boilerplate yet. The store is the next step.'
            : `You have ${productCount} product${productCount === 1 ? '' : 's'} ready to download.`}
        </p>
        <div className="mt-6 sm:mt-8">
          <Button href={productCount === 0 ? '/products' : '/dashboard/library'}>
            {productCount === 0 ? 'Browse the store' : 'Open my products'}
          </Button>
        </div>
      </section>
    </FadeIn>
  )
}
