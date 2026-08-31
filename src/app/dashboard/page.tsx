import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { DownloadButton } from '@/components/products/DownloadButton'
import { createClient } from '@/lib/supabase/server'
import { listUserEntitlements } from '@/server/services/entitlements'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const entitlements = user
    ? await listUserEntitlements(supabase, user.id)
    : []

  return (
    <>
      <PageIntro eyebrow="Dashboard" title="Your account">
        <p>{user?.email}</p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <form action="/auth/signout" method="post">
          <Button type="submit">Sign out</Button>
        </form>

        <section className="mt-24 sm:mt-32 lg:mt-40">
          <h2 className="font-display text-base font-semibold text-neutral-950">
            Your products
          </h2>

          {entitlements.length === 0 ? (
            <div className="mt-6">
              <p className="text-neutral-600">
                You have not purchased any products yet.
              </p>
              <div className="mt-6">
                <Button href="/products">Browse the store</Button>
              </div>
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {entitlements.map((entitlement) => {
                const remaining =
                  entitlement.download_limit - entitlement.download_count
                const limitReached = remaining <= 0

                return (
                  <li
                    key={entitlement.id}
                    className="rounded-3xl ring-1 ring-neutral-950/5 p-6"
                  >
                    <h3 className="font-display text-base font-semibold text-neutral-950">
                      {entitlement.product.name}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      Downloads: {entitlement.download_count}/
                      {entitlement.download_limit}
                    </p>
                    <div className="mt-4">
                      <DownloadButton
                        productId={entitlement.product_id}
                        disabled={limitReached}
                        remaining={limitReached ? undefined : remaining}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </Container>
    </>
  )
}
