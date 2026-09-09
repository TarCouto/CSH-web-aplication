import {
  crossOriginResponse,
  isSameOrigin,
  redirectAfterPost,
} from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Without this, any cross-site form post can force a logout.
  if (!isSameOrigin(request)) {
    return crossOriginResponse()
  }

  const supabase = await createClient()
  await supabase.auth.signOut()

  return redirectAfterPost(request, '/')
}
