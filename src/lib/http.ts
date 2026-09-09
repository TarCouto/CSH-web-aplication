import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { type RateLimitResult } from '@/lib/rate-limit'

export const TEN_MINUTES_MS = 10 * 60 * 1000

export function invalidPayloadResponse() {
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export function tooManyRequestsResponse(
  result: Pick<RateLimitResult, 'resetAt'>,
  message = 'Too many requests. Please try again later.',
) {
  const retryAfter = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000),
  )

  return NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}

/**
 * Cookie-authenticated, state-changing requests must originate from this site.
 * SameSite=Lax alone does not cover top-level cross-site navigation (so a
 * plain link can trigger a GET) nor form posts from a sibling subdomain.
 *
 * A missing Origin/Referer is treated as same-origin: some legitimate clients
 * omit both, and every caller here is additionally session-gated.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const candidate = origin ?? referer

  if (!candidate) return true

  try {
    const candidateHost = new URL(candidate).host
    const allowedHosts = new Set<string>([new URL(env.appUrl).host])

    const forwardedHost = request.headers.get('x-forwarded-host')
    if (forwardedHost) allowedHosts.add(forwardedHost)

    const host = request.headers.get('host')
    if (host) allowedHosts.add(host)

    return allowedHosts.has(candidateHost)
  } catch {
    return false
  }
}

/**
 * Redirect a browser after a form POST.
 *
 * `NextResponse.redirect` defaults to **307**, which preserves the method — the browser
 * would re-POST to the target and a page route answers that with 405, dumping the user
 * on a blank error screen. 303 is the status that tells the browser to switch to GET.
 */
export function redirectAfterPost(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303)
}

export function crossOriginResponse() {
  return NextResponse.json(
    { error: 'Cross-origin request blocked' },
    { status: 403 },
  )
}
