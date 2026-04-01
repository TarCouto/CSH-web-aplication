'use client'

import { useId, useState } from 'react'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'

function TextInput({
  label,
  placeholder,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string; placeholder?: string }) {
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
        type="text"
        id={id}
        {...props}
        placeholder={placeholder}
        className="block w-full border border-neutral-300 bg-transparent px-6 pt-8 pb-3 text-base/6 text-neutral-950 ring-4 ring-transparent transition placeholder:text-neutral-400 group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden"
      />
    </div>
  )
}

function RadioInput({
  label,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  return (
    <label className="flex gap-x-3">
      <input
        type="radio"
        {...props}
        className="h-6 w-6 flex-none appearance-none rounded-full border border-neutral-950/20 outline-hidden checked:border-[0.5rem] checked:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      />
      <span className="text-base/6 text-neutral-950">{label}</span>
    </label>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      budget: formData.get('budget'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <FadeIn className="lg:order-last">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-neutral-950">
              Thank you!
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              We received your message and will get back to you within 24 hours.
            </p>
          </div>
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn className="lg:order-last">
      <form onSubmit={handleSubmit}>
        <h2 className="font-display text-base font-semibold text-neutral-950">
          Work inquiries
        </h2>
        <div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
          <TextInput label="Name" name="name" autoComplete="name" placeholder="John Smith" required />
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="john@company.com"
            required
          />
          <TextInput
            label="Company"
            name="company"
            autoComplete="organization"
            placeholder="Acme Inc."
          />
          <TextInput label="Phone" type="tel" name="phone" autoComplete="tel" placeholder="+1 (555) 123-4567" />
          <TextInput label="Message" name="message" placeholder="Tell us about your project..." required />
          <div className="border border-neutral-300 px-6 py-8 first:rounded-t-2xl last:rounded-b-2xl">
            <fieldset>
              <legend className="text-base/6 text-neutral-500">Budget</legend>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <RadioInput label="$1K – $5K" name="budget" value="1" />
                <RadioInput label="$5K – $10K" name="budget" value="5" />
                <RadioInput label="$10K – $25K" name="budget" value="10" />
                <RadioInput label="$25K – $50K" name="budget" value="25" />
                <RadioInput label="$50K – $100K" name="budget" value="50" />
                <RadioInput label="More than $100K" name="budget" value="100" />
              </div>
            </fieldset>
          </div>
        </div>
        {status === 'error' && (
          <p className="mt-4 text-sm text-red-600">
            Something went wrong. Please try again or email us directly.
          </p>
        )}
        <Button type="submit" className="mt-10" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : "Let's work together"}
        </Button>
      </form>
    </FadeIn>
  )
}
