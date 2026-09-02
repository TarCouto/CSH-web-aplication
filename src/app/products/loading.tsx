import { Container } from '@/components/Container'
import { RootLayout } from '@/components/RootLayout'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-neutral-200 ${className ?? ''}`}
    />
  )
}

export default function ProductsLoading() {
  return (
    <RootLayout>
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="mt-6 h-12 w-full max-w-2xl" />
        <SkeletonBlock className="mt-4 h-20 w-full max-w-xl" />
      </Container>
      <Container className="mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-48 w-full" />
          ))}
        </div>
      </Container>
    </RootLayout>
  )
}
