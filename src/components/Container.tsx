import clsx from 'clsx'

type ContainerProps<T extends React.ElementType> = {
  as?: T
  className?: string
  wide?: boolean
  children: React.ReactNode
}

export function Container<T extends React.ElementType = 'div'>({
  as,
  className,
  wide = false,
  children,
}: Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerProps<T>> &
  ContainerProps<T>) {
  let Component = as ?? 'div'

  return (
    <Component className={clsx('mx-auto max-w-7xl px-5 sm:px-6 lg:px-8', className)}>
      <div
        className={clsx('mx-auto', wide ? 'max-w-none' : 'max-w-2xl lg:max-w-none')}
      >
        {children}
      </div>
    </Component>
  )
}
