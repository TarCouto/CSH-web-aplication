import { createHash } from 'crypto'

import AdmZip from 'adm-zip'
import type { SupabaseClient } from '@supabase/supabase-js'

import { type Database } from '@/lib/supabase/types'

export interface DeliveryResult {
  buffer: Buffer
  filename: string
  contentType: string
}

export interface DeliveryProvider {
  deliver(input: {
    storagePath: string
    productSlug: string
    fingerprint: string
  }): Promise<DeliveryResult>
}

export function buildFingerprint(params: {
  orderId?: string | null
  userId: string
  productId: string
  email?: string | null
  productName: string
}): string {
  const licenseId = createHash('sha256')
    .update(
      `${params.userId}:${params.productId}:${params.orderId ?? ''}`,
    )
    .digest('hex')

  const issuedAt = new Date().toISOString()

  return [
    'Couto Software House — Licensed Product',
    '',
    `Product: ${params.productName}`,
    `License ID: ${licenseId}`,
    `Licensed to: ${params.email ?? 'unknown'}`,
    `Issued: ${issuedAt}`,
    '',
    'This copy is licensed for use by the purchaser only.',
    'Redistribution, sharing, or resale is strictly prohibited.',
    'This copy is traceable to the original purchaser.',
  ].join('\n')
}

export class ZipStorageProvider implements DeliveryProvider {
  constructor(
    private supabase: SupabaseClient<Database>,
    private bucket: string,
  ) {}

  async deliver(input: {
    storagePath: string
    productSlug: string
    fingerprint: string
  }): Promise<DeliveryResult> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(input.storagePath)

    if (error || !data) {
      throw error ?? new Error('Failed to download product archive')
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    const zip = new AdmZip(buffer)
    zip.addFile('LICENSE.txt', Buffer.from(input.fingerprint, 'utf8'))
    const out = zip.toBuffer()

    return {
      buffer: out,
      filename: `${input.productSlug}.zip`,
      contentType: 'application/zip',
    }
  }
}

export class GitHubDeliveryProvider implements DeliveryProvider {
  async deliver(): Promise<DeliveryResult> {
    throw new Error('GitHub delivery not implemented yet')
  }
}
