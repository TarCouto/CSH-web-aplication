import type { SupabaseClient } from '@supabase/supabase-js'

import {
  type Database,
  type Entitlement,
  type Product,
} from '@/lib/supabase/types'

type ProductSummary = Pick<
  Product,
  'id' | 'slug' | 'name' | 'price_cents' | 'currency'
>

export type EntitlementWithProduct = Entitlement & {
  product: ProductSummary
}

export async function listUserEntitlements(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<EntitlementWithProduct[]> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('*, product:products(id, slug, name, price_cents, currency)')
    .eq('user_id', userId)

  if (error || !data) return []
  return data as EntitlementWithProduct[]
}

export async function getEntitlement(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
): Promise<Entitlement | null> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function incrementDownloadCount(
  supabase: SupabaseClient<Database>,
  entitlementId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('increment_download_count', {
    entitlement_id: entitlementId,
  })

  if (error) {
    throw error
  }

  return data === true
}

export async function decrementDownloadCount(
  supabase: SupabaseClient<Database>,
  entitlementId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('decrement_download_count', {
    entitlement_id: entitlementId,
  })

  if (error) {
    throw error
  }

  return data === true
}

/** Roughly one sweep per 20 downloads keeps the audit log inside its retention window. */
const PURGE_SAMPLE_RATE = 0.05

/**
 * Opportunistic retention sweep. Downloads are low volume, so piggybacking on
 * the delivery path avoids depending on a scheduler. Never fails the download:
 * a purge error is logged and swallowed.
 */
export async function purgeExpiredDownloads(
  supabase: SupabaseClient<Database>,
  { force = false }: { force?: boolean } = {},
): Promise<void> {
  if (!force && Math.random() >= PURGE_SAMPLE_RATE) return

  const { error } = await supabase.rpc('purge_expired_downloads', {})

  if (error) {
    console.error('Download retention purge failed:', error)
  }
}
