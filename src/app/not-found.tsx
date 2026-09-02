import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { NO_INDEX_ROBOTS } from '@/lib/metadata'
import { RootLayout } from '@/components/RootLayout'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for could not be found.',
  robots: NO_INDEX_ROBOTS,
}

export default function NotFound() {
  return (
    <RootLayout>
      <Container className="flex h-full items-center pt-24 sm:pt-32 lg:pt-40">
        <FadeIn className="flex max-w-xl flex-col items-center text-center">
          <p className="font-display text-4xl font-semibold text-neutral-950 sm:text-5xl">
            404
          </p>
          <h1 className="mt-4 font-display text-2xl font-semibold text-neutral-950">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <Link
            href="/"
            className="mt-4 text-sm font-semibold text-neutral-950 transition hover:text-neutral-700"
          >
            Go to the home page
          </Link>
        </FadeIn>
      </Container>
    </RootLayout>
  )
}
