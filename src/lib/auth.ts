export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 2

const baseSessionCookieOptions = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  sameSite: 'lax' as const,
  path: '/',
}

/** Browser client — cannot set httpOnly cookies from JavaScript. */
export const sessionCookieOptions = {
  ...baseSessionCookieOptions,
  secure: process.env.NODE_ENV === 'production',
}

/** Server / middleware — full security flags for Set-Cookie headers. */
export const serverSessionCookieOptions = {
  ...baseSessionCookieOptions,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
}

export const SIGNUP_CONFIRM_SUCCESS_PATH = '/signup/confirmed'
export const SIGNUP_CONFIRM_FAILED_PATH = '/signup/confirm-failed'

export function isSignupConfirmFlow(next: string | null | undefined): boolean {
  return next === SIGNUP_CONFIRM_SUCCESS_PATH
}

export function safeRedirectPath(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    value.includes('://')
  ) {
    return '/dashboard'
  }
  return value
}
