'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import {
  SIGNUP_CONFIRM_FAILED_PATH,
  SIGNUP_CONFIRM_SUCCESS_PATH,
} from '@/lib/auth'

type ConfirmEmailButtonProps = {
  failurePath?: string
  defaultRedirect?: string
}

export function ConfirmEmailButton({
  failurePath = SIGNUP_CONFIRM_FAILED_PATH,
  defaultRedirect = SIGNUP_CONFIRM_SUCCESS_PATH,
}: ConfirmEmailButtonProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? defaultRedirect

  async function handleConfirm() {
    if (!tokenHash || !type) {
      router.push(failurePath)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_hash: tokenHash, type, next }),
      })

      const data = (await response.json()) as {
        redirect?: string
        error?: string
      }

      if (!response.ok) {
        setError(data.error ?? 'Confirmation failed.')
        setLoading(false)
        return
      }

      router.push(data.redirect ?? defaultRedirect)
      router.refresh()
    } catch {
      setError('Confirmation failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <FadeIn className="max-w-lg">
      <p className="text-base text-neutral-600">
        Click the button below to confirm your email address. This extra step
        keeps automated email scanners from using your confirmation link before
        you do.
      </p>
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="button" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Confirming...' : 'Confirm my email'}
        </Button>
        <Button href={failurePath} invert>
          Cancel
        </Button>
      </div>
    </FadeIn>
  )
}
