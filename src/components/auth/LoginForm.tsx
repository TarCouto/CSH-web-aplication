'use client'

import { useId, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(redirect || '/dashboard')
    router.refresh()
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
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" className="mt-10" disabled={loading}>
          {loading ? 'Signing in...' : 'Log in'}
        </Button>
      </form>
    </FadeIn>
  )
}
