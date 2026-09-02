function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function resolveAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_APP_URL')
    }
    return 'http://localhost:3000'
  }
  return url
}

function resolveDownloadLimit(): number {
  const parsed = Number(process.env.DOWNLOAD_LIMIT ?? 5)
  return Number.isFinite(parsed) ? parsed : 5
}

export const env = {
  appUrl: resolveAppUrl(),

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

  downloadLimit: resolveDownloadLimit(),
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
