/** Canonical public site URL — used for metadata, sitemap, and robots. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://couto.software'
