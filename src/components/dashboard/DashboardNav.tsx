'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export const dashboardLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/library', label: 'My products' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/purchases', label: 'Purchases' },
  { href: '/dashboard/billing', label: 'Billing' },
  { href: '/products', label: 'Store' },
] as const

function isActiveDashboardLink(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function navLinkClassName(isActive: boolean, compact = false) {
  return clsx(
    'shrink-0 rounded-full font-semibold transition',
    compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-1.5 text-sm',
    isActive
      ? 'bg-neutral-950 text-white'
      : 'bg-neutral-950/5 text-neutral-950 hover:bg-neutral-950/10',
  )
}

export function DashboardNav({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Dashboard" className={clsx('flex flex-col gap-2', className)}>
      {dashboardLinks.map((link) => {
        const isActive = isActiveDashboardLink(pathname, link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={navLinkClassName(isActive, compact)}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardMobileNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <div className="sticky top-[4.25rem] z-30 -mx-5 border-b border-neutral-950/5 bg-white/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
      <div className="flex items-center justify-between gap-3 pb-3">
        <p className="min-w-0 truncate text-xs text-neutral-600">{email}</p>
        <form action="/auth/signout" method="post" className="shrink-0">
          <button
            type="submit"
            className="text-xs font-semibold text-neutral-950 transition hover:text-neutral-600"
          >
            Sign out
          </button>
        </form>
      </div>

      <nav
        aria-label="Dashboard"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {dashboardLinks.map((link) => {
          const isActive = isActiveDashboardLink(pathname, link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={navLinkClassName(isActive, true)}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
