import Link from 'next/link'

import { FadeIn } from '@/components/FadeIn'
import { formatPrice } from '@/lib/money'
import { type Json, type Product } from '@/lib/supabase/types'

function asStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export function ProductCard({ product }: { product: Product }) {
  const techStack = asStringArray(product.tech_stack)

  return (
    <FadeIn className="flex">
      <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
        <h3>
          <Link href={`/products/${product.slug}`}>
            <span className="absolute inset-0 rounded-3xl" />
            <span className="font-display text-2xl font-semibold text-neutral-950">
              {product.name}
            </span>
          </Link>
        </h3>
        {product.tagline && (
          <p className="mt-4 text-base text-neutral-600">{product.tagline}</p>
        )}
        <p className="mt-6 font-display text-lg font-semibold text-neutral-950">
          {formatPrice(product.price_cents, product.currency)}
        </p>
        {techStack.length > 0 && (
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
        )}
      </article>
    </FadeIn>
  )
}
