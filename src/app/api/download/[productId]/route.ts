import { NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  buildFingerprint,
  ZipStorageProvider,
} from '@/server/services/delivery'
import {
  getEntitlement,
  incrementDownloadCount,
} from '@/server/services/entitlements'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?redirect=/dashboard', env.appUrl),
      )
    }

    const { allowed, resetAt } = rateLimit(`download:${user.id}`, {
      limit: 10,
      windowMs: 60000,
    })

    if (!allowed) {
      return new NextResponse(
        'Too many download requests. Please wait a moment.',
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((resetAt - Date.now()) / 1000),
            ),
          },
        },
      )
    }

    const entitlement = await getEntitlement(supabase, user.id, productId)

    if (!entitlement) {
      return new NextResponse('You do not have access to this product.', {
        status: 403,
      })
    }

    if (entitlement.download_count >= entitlement.download_limit) {
      return new NextResponse('Download limit reached', { status: 403 })
    }

    const serviceClient = createServiceClient()

    const { data: product, error: productError } = await serviceClient
      .from('products')
      .select('storage_path, slug, name')
      .eq('id', productId)
      .maybeSingle()

    if (productError || !product?.storage_path) {
      return new NextResponse('Product not available for download.', {
        status: 404,
      })
    }

    const fingerprint = buildFingerprint({
      orderId: entitlement.order_id,
      userId: user.id,
      productId,
      email: user.email,
      productName: product.name,
    })

    const provider = new ZipStorageProvider(
      serviceClient,
      env.supabase.productsBucket,
    )

    const result = await provider.deliver({
      storagePath: product.storage_path,
      productSlug: product.slug,
      fingerprint,
    })

    const ip = request.headers.get('x-forwarded-for')
    const userAgent = request.headers.get('user-agent')

    const { error: downloadError } = await serviceClient
      .from('downloads')
      .insert({
        entitlement_id: entitlement.id,
        user_id: user.id,
        product_id: productId,
        ip,
        user_agent: userAgent,
      })

    if (downloadError) {
      throw downloadError
    }

    await incrementDownloadCount(
      serviceClient,
      entitlement.id,
      entitlement.download_count,
    )

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Download failed:', error)
    return new NextResponse('Download failed. Please try again later.', {
      status: 500,
    })
  }
}
