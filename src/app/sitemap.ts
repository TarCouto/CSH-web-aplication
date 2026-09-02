import { type MetadataRoute } from 'next'

import { loadArticles, loadCaseStudies } from '@/lib/mdx'
import { SITE_URL } from '@/lib/site-url'
import { createClient } from '@/lib/supabase/server'
import { listPublishedProducts } from '@/server/services/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, caseStudies] = await Promise.all([
    loadArticles(),
    loadCaseStudies(),
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/process`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/eula`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}${article.href}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies.map(
    (caseStudy) => ({
      url: `${SITE_URL}${caseStudy.href}`,
      lastModified: new Date(`${caseStudy.date}-01`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }),
  )

  let productEntries: MetadataRoute.Sitemap = []

  try {
    const supabase = await createClient()
    const products = await listPublishedProducts(supabase)

    productEntries = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // Supabase unavailable — static entries only
  }

  return [
    ...staticEntries,
    ...caseStudyEntries,
    ...articleEntries,
    ...productEntries,
  ]
}
