'use client'

import clsx from 'clsx'

import { useTheme } from '@/components/theme/ThemeProvider'

function SunIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
      <path d="M12 2.25v2.25M12 19.5v2.25M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M2.25 12h2.25M19.5 12h2.25M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59" />
    </svg>
  )
}

function MoonIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3Z" />
    </svg>
  )
}

export function ThemeToggle({ invert = false }: { invert?: boolean }) {
  const { toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        'group -m-2.5 rounded-full p-2.5 transition',
        invert ? 'hover:bg-white/10' : 'hover:bg-neutral-950/10',
      )}
      aria-label="Toggle dark mode"
    >
      <SunIcon
        className={clsx(
          'hidden h-6 w-6 fill-none stroke-[1.5] dark:block',
          invert
            ? 'stroke-white group-hover:stroke-neutral-200'
            : 'stroke-neutral-950 group-hover:stroke-neutral-700',
        )}
      />
      <MoonIcon
        className={clsx(
          'h-6 w-6 dark:hidden',
          invert
            ? 'fill-white group-hover:fill-neutral-200'
            : 'fill-neutral-950 group-hover:fill-neutral-700',
        )}
      />
    </button>
  )
}
