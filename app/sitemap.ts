import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/bai-viet`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/danh-muc`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const postRoutes: MetadataRoute.Sitemap = (posts || []).map(post => ({
    url: `${baseUrl}/bai-viet/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map(cat => ({
    url: `${baseUrl}/danh-muc/${cat.slug}`,
    lastModified: new Date(cat.created_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes, ...categoryRoutes]
}
