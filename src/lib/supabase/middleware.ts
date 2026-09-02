import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { safeRedirectPath, serverSessionCookieOptions } from '@/lib/auth'
import { getPublicSupabaseConfig, isSupabaseConfigured } from '@/lib/env'
import { type Database } from '@/lib/supabase/types'

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie)
  })
  return to
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      )
    }
    return supabaseResponse
  }

  const { url, anonKey } = getPublicSupabaseConfig()

  const supabase = createServerClient<Database>(url, anonKey, {
    cookieOptions: serverSessionCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (user && isAuthPage) {
    const next = safeRedirectPath(request.nextUrl.searchParams.get('redirect'))
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = next
    redirectUrl.search = ''
    return copyCookies(supabaseResponse, NextResponse.redirect(redirectUrl))
  }

  return supabaseResponse
}
