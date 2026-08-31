import type { SupabaseClient } from '@supabase/supabase-js'

import { type Database, type Profile } from '@/lib/supabase/types'

export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function updateProfileName(
  supabase: SupabaseClient<Database>,
  userId: string,
  fullName: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)

  if (error) return { error: error.message }
  return { error: null }
}
