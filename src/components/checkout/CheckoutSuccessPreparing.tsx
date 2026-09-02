'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MAX_REFRESHES = 4
const REFRESH_MS = 2000
const STORAGE_KEY = 'csh-checkout-success-wait'

export function CheckoutSuccessPreparing({ sessionId }: { sessionId?: string }) {
  const router = useRouter()
  const storageKey = `${STORAGE_KEY}:${sessionId ?? 'none'}`

  useEffect(() => {
    const attempts = Number(sessionStorage.getItem(storageKey) ?? '0')
    if (attempts >= MAX_REFRESHES) {
      return
    }

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(storageKey, String(attempts + 1))
      router.refresh()
    }, REFRESH_MS)

    return () => window.clearTimeout(timer)
  }, [router, storageKey])

  return (
    <p className="text-base text-neutral-600">
      Preparing your download. This usually takes a few seconds.
    </p>
  )
}
