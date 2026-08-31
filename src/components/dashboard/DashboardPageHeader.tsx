export function DashboardPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header>
      <p className="hidden font-display text-sm font-semibold text-neutral-950 sm:block lg:text-base">
        {eyebrow}
      </p>
      <h1 className="font-display text-3xl font-medium tracking-tight text-neutral-950 sm:mt-6 sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:mt-4 sm:text-base">
        {description}
      </p>
    </header>
  )
}
