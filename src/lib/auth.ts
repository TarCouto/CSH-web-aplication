export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 2

export const sessionCookieOptions = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  sameSite: 'lax' as const,
  path: '/',
}

export function safeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard'
  }
  return value
}
