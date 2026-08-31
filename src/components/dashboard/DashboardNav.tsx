'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/library', label: 'My products' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/purchases', label: 'Purchases' },
  { href: '/dashboard/billing', label: 'Billing' },
  { href: '/products', label: 'Store' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="mt-10 flex flex-col gap-2">
      {links.map((link) => {
        const isActive =
          link.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
              isActive
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-950 hover:bg-neutral-950/5',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
