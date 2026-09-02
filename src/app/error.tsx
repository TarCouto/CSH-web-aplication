'use client'

import { useEffect } from 'react'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { RootLayout } from '@/components/RootLayout'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <RootLayout>
      <Container className="flex min-h-[50vh] items-center pt-24 sm:pt-32 lg:pt-40">
        <div className="max-w-xl">
          <h1 className="font-display text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mt-4 text-base text-neutral-600">
            An unexpected error occurred. Please try again, or contact us if the
            problem persists.
          </p>
          <div className="mt-8">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      </Container>
    </RootLayout>
  )
}
