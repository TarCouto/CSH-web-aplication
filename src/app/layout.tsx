import { type Metadata } from 'next'

import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider'
import { JsonLd } from '@/components/JsonLd'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { themeInitScript } from '@/components/theme/theme-init'
import { isSupabaseConfigured } from '@/lib/env'
import { SITE_URL } from '@/lib/site-url'
import { createClient } from '@/lib/supabase/server'
import '@/styles/tailwind.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s - Couto Software House',
    default: 'Couto Software House - High-Performance Web Applications',
  },
  description:
    'Brazilian software engineering company specializing in high-performance web applications, SPAs, and conversion-focused digital products.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Couto Software House',
    title: 'Couto Software House - High-Performance Web Applications',
    description:
      'Brazilian software engineering company specializing in high-performance web applications, SPAs, and conversion-focused digital products.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Couto Software House - High-Performance Web Applications',
    description:
      'Brazilian software engineering company specializing in high-performance web applications, SPAs, and conversion-focused digital products.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'MrKKzQ_BpfvXsWmtmZaozaix2PFMKaRNLVXO-UafSps',
  },
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  let isAuthenticated = false

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isAuthenticated = Boolean(user)
  }

  return (
    <html lang="en" className="h-full bg-white text-base antialiased overflow-x-hidden" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <AuthSessionProvider isAuthenticated={isAuthenticated}>
          <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Couto Software House',
            url: SITE_URL,
            description:
              'Brazilian software engineering company specializing in high-performance web applications.',
            foundingDate: '2021',
            founder: {
              '@type': 'Person',
              name: 'Tarcisio Couto',
            },
            knowsAbout: [
              'Web Development',
              'React',
              'Next.js',
              'Angular',
              'TypeScript',
              'Performance Optimization',
              'Design Systems',
            ],
          }}
        />
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
