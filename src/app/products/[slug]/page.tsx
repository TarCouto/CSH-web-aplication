import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Border } from '@/components/Border'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { BuyButton } from '@/components/products/BuyButton'
import { RootLayout } from '@/components/RootLayout'
import { formatPrice } from '@/lib/money'
import { AFTER_INTRO_Y } from '@/lib/spacing'
import { createClient } from '@/lib/supabase/server'
import { type Json } from '@/lib/supabase/types'
import { getPublishedProductBySlug } from '@/server/services/products'

function asStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const product = await getPublishedProductBySlug(supabase, slug)

  if (!product) {
    return {
      title: 'Product not found',
    }
  }

  return {
    title: product.name,
    description: product.tagline ?? product.description ?? undefined,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${product.name} - Couto Software House`,
      description: product.tagline ?? product.description ?? undefined,
      url: `/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const product = await getPublishedProductBySlug(supabase, slug)

  if (!product) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = asStringArray(product.features)
  const techStack = asStringArray(product.tech_stack)
  const paragraphs = product.description
    ? product.description.split(/\n\n+/).filter(Boolean)
    : []

  return (
    <RootLayout>
      <PageIntro eyebrow="Boilerplate" title={product.name}>
        {product.tagline && <p>{product.tagline}</p>}
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <FadeIn>
          {paragraphs.length > 0 && (
            <div className="max-w-3xl space-y-6 text-base text-neutral-600">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}

          {features.length > 0 && (
            <Border className="mt-16 pt-16">
              <h2 className="font-display text-base font-semibold text-neutral-950">
                Features
              </h2>
              <ul className="mt-6 space-y-4 text-base text-neutral-600">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-neutral-950"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </Border>
          )}

          {techStack.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-base font-semibold text-neutral-950">
                Tech stack
              </h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {techStack.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-16">
            <p className="font-display text-3xl font-semibold text-neutral-950">
              {formatPrice(product.price_cents, product.currency)}
            </p>
            <div className="mt-8">
              <BuyButton
                productId={product.id}
                slug={product.slug}
                isAuthenticated={!!user}
              />
            </div>
          </div>
        </FadeIn>
      </Container>
    </RootLayout>
  )
}
