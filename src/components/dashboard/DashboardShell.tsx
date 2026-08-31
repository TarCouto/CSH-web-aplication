import { Container } from '@/components/Container'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { FadeIn } from '@/components/FadeIn'

export function DashboardShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40 mb-24 sm:mb-32">
      <div className="grid items-start gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
        <FadeIn>
          <aside className="rounded-4xl bg-white p-8 ring-1 ring-neutral-950/5">
            <p className="font-display text-base font-semibold text-neutral-950">
              Account
            </p>
            <p className="mt-3 truncate text-sm text-neutral-600">{email}</p>

            <DashboardNav />

            <form action="/auth/signout" method="post" className="mt-10 border-t border-neutral-950/5 pt-8">
              <button
                type="submit"
                className="text-sm font-semibold text-neutral-950 transition hover:text-neutral-600"
              >
                Sign out
              </button>
            </form>
          </aside>
        </FadeIn>

        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  )
}
