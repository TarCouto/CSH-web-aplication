import clsx from 'clsx'

import { Border } from '@/components/Border'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

export function StatList({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof FadeInStagger>, 'children'> & {
  children: React.ReactNode
}) {
  return (
    <FadeInStagger {...props}>
      <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
        {children}
      </dl>
    </FadeInStagger>
  )
}

export function StatListItem({
  label,
  value,
  invert = false,
}: {
  label: string
  value: string
  invert?: boolean
}) {
  return (
    <Border as={FadeIn} position="left" invert={invert} className="flex flex-col-reverse pl-6 sm:pl-8">
      <dt className={clsx('mt-2 text-sm sm:text-base', invert ? 'text-neutral-400' : 'text-neutral-600')}>{label}</dt>
      <dd className={clsx('font-display text-2xl font-semibold sm:text-3xl lg:text-4xl', invert ? 'text-white' : 'text-neutral-950')}>
        {value}
      </dd>
    </Border>
  )
}
