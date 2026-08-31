function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    get serviceRoleKey() {
      return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
    },
    productsBucket: process.env.SUPABASE_PRODUCTS_BUCKET ?? 'products',
  },

  stripe: {
    get secretKey() {
      return required('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY)
    },
    get webhookSecret() {
      return required('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET)
    },
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  downloadLimit: Number(process.env.DOWNLOAD_LIMIT ?? 5),
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getPublicSupabaseConfig() {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL', env.supabase.url),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY', env.supabase.anonKey),
  }
}

export function isSupabaseConfigured() {
  return Boolean(env.supabase.url && env.supabase.anonKey)
}
