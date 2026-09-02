import { Container } from '@/components/Container'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-neutral-200 ${className ?? ''}`}
    />
  )
}

export default function DashboardLoading() {
  return (
    <Container className="pt-4 lg:pt-0">
      <SkeletonBlock className="h-6 w-24" />
      <SkeletonBlock className="mt-4 h-10 w-full max-w-md" />
      <SkeletonBlock className="mt-4 h-16 w-full max-w-xl" />
      <div className="mt-8 space-y-4 sm:mt-12">
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
    </Container>
  )
}
