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
