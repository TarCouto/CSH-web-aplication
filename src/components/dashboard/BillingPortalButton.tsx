'use client'

import { useState } from 'react'

import { Button } from '@/components/Button'

export function BillingPortalButton({ disabled }: { disabled?: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not open billing.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Could not open billing.')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button type="button" onClick={handleClick} disabled={disabled || loading}>
        {loading ? 'Opening...' : 'Manage billing'}
      </Button>
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
