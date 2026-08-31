'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/Button'

export function BuyButton({
  productId,
  slug,
  isAuthenticated,
}: {
  productId: string
  slug: string
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${slug}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        throw new Error('Checkout failed')
      }

      const data = (await response.json()) as { url?: string }

      if (!data.url) {
        throw new Error('Checkout URL missing')
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Processing…' : 'Buy now'}
      </Button>
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
