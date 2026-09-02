export function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    const ip = vercelForwarded.trim()
    if (ip) {
      return ip
    }
  }

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean)
    if (hops.length > 0) {
      return hops[hops.length - 1]!
    }
  }

  return 'unknown'
}
