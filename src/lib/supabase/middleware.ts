import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { safeRedirectPath, sessionCookieOptions } from '@/lib/auth'
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
    return supabaseResponse
  }

  const { url, anonKey } = getPublicSupabaseConfig()

  const supabase = createServerClient<Database>(url, anonKey, {
    cookieOptions: sessionCookieOptions,
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
