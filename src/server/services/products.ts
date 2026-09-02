import type { SupabaseClient } from '@supabase/supabase-js'

import {
  type Database,
  type Product,
  type PublicProduct,
} from '@/lib/supabase/types'

/**
 * Columns readable through the public API. Must stay in sync with the column
 * grants in 0005_column_privileges.sql — storage_path and the Stripe ids are
 * revoked from anon/authenticated, so selecting them here would fail.
 */
const PUBLIC_PRODUCT_COLUMNS =
  'id, slug, name, tagline, description, features, tech_stack, price_cents, currency, cover_image, status, created_at, updated_at'

export async function listPublishedProducts(
  supabase: SupabaseClient<Database>,
): Promise<PublicProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLUMNS)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as PublicProduct[]
}

export async function getPublishedProductBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PublicProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PUBLIC_PRODUCT_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) return null
  return data as PublicProduct | null
}

/**
 * Full product row for server-side payment work. Requires a service-role
 * client: stripe_price_id is not readable by anon/authenticated.
 */
export async function getPublishedProductForCheckout(
  service: SupabaseClient<Database>,
  productId: string,
): Promise<Product | null> {
  const { data, error } = await service
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('status', 'published')
    .maybeSingle()

  if (error) return null
  return data
}
