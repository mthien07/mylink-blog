import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/supabase/queries'
import { CommentSection } from '@/components/blog/comment-section'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getInitials } from '@/lib/utils'
import { Eye, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Bài viết không tồn tại' }
  return {
    title: post.title || 'Bài viết',
    description: post.excerpt || post.title || '',
    openGraph: {
      title: post.title || 'Bài viết',
      description: post.excerpt || undefined,
      images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author?.display_name || post.author?.email || 'Unknown'],
    },
  }
}

function estimateReadTime(content: string): number {
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  // Increment view count (fire and forget)
  const supabase = await createClient()
  supabase.rpc('increment_view_count', { post_slug: slug })

  const readTime = estimateReadTime(post.content)

  return (
    <article className="container mx-auto px-4 py-10 max-w-4xl">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.thumbnail_url,
            author: { '@type': 'Person', name: post.author?.display_name || post.author?.email },
            datePublished: post.published_at,
            dateModified: post.updated_at,
          }),
        }}
      />

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <Link href={`/danh-muc/${post.category.slug}`} className="mb-4 inline-block">
            <Badge variant="secondary">{post.category.name}</Badge>
          </Link>
        )}

        <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 pb-6 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url || ''} />
              <AvatarFallback>{getInitials(post.author?.display_name || post.author?.email || 'U')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.author?.display_name || post.author?.email}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.published_at || post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime} phút đọc
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.view_count.toLocaleString()} lượt xem
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Thumbnail */}
      {post.thumbnail_url && (
        <div className="relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
          <Image src={post.thumbnail_url} alt={post.title || ''} fill className="object-cover" priority />
        </div>
      )}

      {/* Content */}
      <div
        className="prose dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments */}
      <CommentSection postId={post.id} />
    </article>
  )
}
