'use client'

import { useId, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import { createClient } from '@/lib/supabase/client'

function TextInput({
  label,
  type = 'text',
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  let id = useId()

  return (
    <div className="group relative z-0 transition-all focus-within:z-10">
      <label
        htmlFor={id}
        className="absolute top-3 left-6 text-xs font-semibold text-neutral-950"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        {...props}
        className="block w-full rounded-2xl border border-neutral-300 bg-transparent px-6 pt-8 pb-3 text-base/6 text-neutral-950 ring-4 ring-transparent transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden"
      />
    </div>
  )
}

export function SignupForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (redirect) {
      callbackUrl.searchParams.set('next', redirect)
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setConfirmed(true)
    setLoading(false)
  }

  if (confirmed) {
    return (
      <FadeIn>
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold text-neutral-950">
            Check your email
          </h2>
          <p className="mt-4 text-base text-neutral-600">
            We sent you a confirmation link. Please check your inbox to verify
            your account.
          </p>
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
          />
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" className="mt-10" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </FadeIn>
  )
}
