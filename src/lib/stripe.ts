import Stripe from 'stripe'

import { env } from '@/lib/env'

let stripe: Stripe | undefined

export function getStripe() {
  if (!stripe) {
    stripe = new Stripe(env.stripe.secretKey, {
      apiVersion: '2026-08-26.dahlia',
    })
  }
  return stripe
}
