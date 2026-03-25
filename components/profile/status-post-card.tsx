'use client'
import Image from 'next/image'
import { Heart, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import type { Post } from '@/lib/types'

interface StatusPostCardProps {
  post: Post
}

export function StatusPostCard({ post }: StatusPostCardProps) {
  const images: string[] = Array.isArray(post.images) ? post.images : []

  return (
    <div className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {images.length > 0 && (
        <div className={`mt-3 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.slice(0, 4).map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-muted">
              <Image src={src} alt={`Ảnh ${idx + 1}`} fill className="object-cover" sizes="200px" />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeDate(post.published_at || post.created_at)}
        </span>
        {post.like_count !== undefined && (
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {post.like_count}
          </span>
        )}
      </div>
    </div>
  )
}
