'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, MessageCircle, Clock, ThumbsUp, Share2 } from 'lucide-react'
import { formatRelativeDate, getInitials, truncate } from '@/lib/utils'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
  featured?: boolean
  index?: number
}

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function PostCard({ post, featured = false, index = 0 }: PostCardProps) {
  const readTime = estimateReadTime(post.content)

  return (
    <article
      className="animate-fade-in-up bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Post header: avatar + author + meta */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href={post.author?.username ? `/nguoi-dung/${post.author.username}` : '#'}>
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={post.author?.avatar_url || ''} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(post.author?.display_name || post.author?.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={post.author?.username ? `/nguoi-dung/${post.author.username}` : '#'}
              className="text-sm font-semibold hover:underline"
            >
              {post.author?.display_name || post.author?.email}
            </Link>
            {post.category && (
              <>
                <span className="text-muted-foreground text-xs">trong</span>
                <Link href={`/danh-muc/${post.category.slug}`}>
                  <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-4 font-medium">
                    {post.category.name}
                  </Badge>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <span>{formatRelativeDate(post.published_at || post.created_at)}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{readTime} phút đọc</span>
          </div>
        </div>
      </div>

      {/* Title + excerpt */}
      <div className="px-4 pb-3">
        <Link href={`/bai-viet/${post.slug}`}>
          <h2 className="text-base font-bold leading-snug hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            {truncate(post.excerpt, featured ? 180 : 120)}
          </p>
        )}
      </div>

      {/* Thumbnail */}
      {post.thumbnail_url && (
        <Link href={`/bai-viet/${post.slug}`} className="block">
          <div className="relative h-52 sm:h-64 bg-muted overflow-hidden">
            <Image
              src={post.thumbnail_url}
              alt={post.title || ''}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 680px"
            />
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground border-b">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {(post.like_count || 0).toLocaleString()}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {(post.comment_count || 0)} bình luận
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {post.view_count.toLocaleString()}
        </span>
      </div>

      {/* Interaction bar */}
      <div className="px-2 py-1 flex items-center">
        <Link
          href={`/bai-viet/${post.slug}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <ThumbsUp className="h-4 w-4" />
          Thích
        </Link>
        <Link
          href={`/bai-viet/${post.slug}#comments`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          Bình luận
        </Link>
        <Link
          href={`/bai-viet/${post.slug}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <Share2 className="h-4 w-4" />
          Chia sẻ
        </Link>
      </div>
    </article>
  )
}
