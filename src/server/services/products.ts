import type { SupabaseClient } from '@supabase/supabase-js'

import { type Database, type Product } from '@/lib/supabase/types'

export async function listPublishedProducts(
  supabase: SupabaseClient<Database>,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getPublishedProductBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) return null
  return data
}
