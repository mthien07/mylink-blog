'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, MessageCircle } from 'lucide-react'
import { formatDate, getInitials, truncate } from '@/lib/utils'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-all duration-300 ${featured ? 'md:flex gap-0' : ''}`}
    >
      {post.thumbnail_url && (
        <Link href={`/bai-viet/${post.slug}`} className={`block overflow-hidden ${featured ? 'md:w-2/5 shrink-0' : ''}`}>
          <div className={`relative ${featured ? 'h-48 md:h-full' : 'h-48'} bg-muted`}>
            <Image
              src={post.thumbnail_url}
              alt={post.title || ''}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          {post.category && (
            <Link href={`/danh-muc/${post.category.slug}`} className="mb-2 inline-block">
              <Badge variant="secondary" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                {post.category.name}
              </Badge>
            </Link>
          )}

          <Link href={`/bai-viet/${post.slug}`}>
            <h2 className={`font-bold leading-tight hover:text-primary transition-colors mb-2 ${featured ? 'text-xl md:text-2xl' : 'text-lg'}`}>
              {post.title}
            </h2>
          </Link>

          {post.excerpt && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {truncate(post.excerpt, featured ? 200 : 120)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.author?.avatar_url || ''} />
              <AvatarFallback className="text-xs">{getInitials(post.author?.display_name || post.author?.email || 'U')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium">{post.author?.display_name || post.author?.email}</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.published_at || post.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count.toLocaleString()}</span>
            {post.comment_count !== undefined && (
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comment_count}</span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
