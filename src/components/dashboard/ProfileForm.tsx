'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/Button'
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
        className="block w-full rounded-2xl border border-neutral-300 bg-transparent px-6 pt-8 pb-3 text-base/6 text-neutral-950 ring-4 ring-transparent transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden disabled:bg-neutral-50 disabled:text-neutral-500"
      />
    </div>
  )
}

export function ProfileForm({
  userId,
  email,
  fullName,
}: {
  userId: string
  email: string
  fullName: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const nextName = String(formData.get('fullName') ?? '').trim()

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: nextName || null })
      .eq('id', userId)

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          name="email"
          defaultValue={email}
          disabled
        />
        <TextInput
          label="Full name"
          name="fullName"
          defaultValue={fullName}
          placeholder="Your name"
          maxLength={120}
        />
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 text-sm text-neutral-600" role="alert">
          Profile updated.
        </p>
      )}
      <Button type="submit" className="mt-10" disabled={loading}>
        {loading ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
