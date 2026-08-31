import { Container } from '@/components/Container'
import { DashboardAccountPanel } from '@/components/dashboard/DashboardAccountPanel'

export function DashboardShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  return (
    <Container wide className="mt-4 sm:mt-8 lg:mt-40 mb-16 sm:mb-24 lg:mb-32">
      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-20">
        <DashboardAccountPanel email={email} />

        <div className="min-w-0 lg:pt-0">{children}</div>
      </div>
    </Container>
  )
}
