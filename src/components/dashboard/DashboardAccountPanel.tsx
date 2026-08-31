import {
  DashboardMobileNav,
  DashboardNav,
} from '@/components/dashboard/DashboardNav'
import { FadeIn } from '@/components/FadeIn'

function SignOutButton() {
  return (
    <form
      action="/auth/signout"
      method="post"
      className="mt-10 border-t border-neutral-950/5 pt-8"
    >
      <button
        type="submit"
        className="text-sm font-semibold text-neutral-950 transition hover:text-neutral-600"
      >
        Sign out
      </button>
    </form>
  )
}

export function DashboardAccountPanel({ email }: { email: string }) {
  return (
    <>
      <FadeIn className="lg:hidden">
        <DashboardMobileNav email={email} />
      </FadeIn>

      <FadeIn className="hidden lg:block">
        <aside className="rounded-4xl bg-white p-8 ring-1 ring-neutral-950/5">
          <p className="font-display text-base font-semibold text-neutral-950">
            Account
          </p>
          <p className="mt-3 truncate text-sm text-neutral-600">{email}</p>
          <DashboardNav className="mt-10" />
          <SignOutButton />
        </aside>
      </FadeIn>
    </>
  )
}
