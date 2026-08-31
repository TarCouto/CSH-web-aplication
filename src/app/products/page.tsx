import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { ProductCard } from '@/components/products/ProductCard'
import { RootLayout } from '@/components/RootLayout'
import { createClient } from '@/lib/supabase/server'
import { listPublishedProducts } from '@/server/services/products'

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Production-ready boilerplates and starter kits built for speed, scalability, and modern web development.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Products - Couto Software House',
    description:
      'Production-ready boilerplates and starter kits built for speed, scalability, and modern web development.',
    url: '/products',
  },
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const products = await listPublishedProducts(supabase)

  return (
    <RootLayout>
      <PageIntro
        eyebrow="Store"
        title="Production-ready boilerplates."
      >
        <p>
          Skip weeks of setup. Each boilerplate includes authentication,
          payments, and deployment-ready architecture so you can ship faster.
        </p>
      </PageIntro>

      <Container className="mt-16">
        {products.length === 0 ? (
          <FadeIn>
            <p className="text-center text-lg text-neutral-600">
              No products yet.
            </p>
          </FadeIn>
        ) : (
          <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </FadeInStagger>
        )}
      </Container>
    </RootLayout>
  )
}
