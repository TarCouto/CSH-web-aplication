export function FadeIn(props: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} />
}

export function FadeInStagger({
  faster: _faster,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { faster?: boolean }) {
  return <div {...props} />
}
