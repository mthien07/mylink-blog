'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import { LikeButton } from './like-button'
import { StatusCommentSection } from './status-comment-section'
import type { Post, User } from '@/lib/types'

interface StatusCardProps {
  post: Post
  currentUser: User | null
  onDelete?: (postId: string) => void
}

export function StatusCard({ post, currentUser, onDelete }: StatusCardProps) {
  const author = post.author
  const isOwner = currentUser?.id === post.author_id
  const displayName = author?.display_name || author?.email || 'Người dùng'
  const username = author?.username

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-card border rounded-xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href={username ? `/nguoi-dung/${username}` : '#'}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={author?.avatar_url || ''} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={username ? `/nguoi-dung/${username}` : '#'}
              className="font-medium text-sm hover:text-primary transition-colors"
            >
              {displayName}
            </Link>
            {username && (
              <p className="text-xs text-muted-foreground">@{username}</p>
            )}
            <p className="text-xs text-muted-foreground">{formatRelativeDate(post.created_at)}</p>
          </div>
        </div>

        {isOwner && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onDelete(post.id)}
            title="Xóa bài viết"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <PostImageGrid images={post.images} />
      )}

      {/* Footer */}
      <div className="pt-1 border-t space-y-2">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialCount={post.like_count ?? 0}
            initialLiked={post.liked_by_user ?? false}
          />
        </div>
        <StatusCommentSection postId={post.id} commentCount={post.comment_count ?? 0} />
      </div>
    </motion.article>
  )
}

function PostImageGrid({ images }: { images: string[] }) {
  const count = images.length

  if (count === 1) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden aspect-video bg-muted">
        <Image src={images[0]} alt="post image" fill className="object-cover" sizes="(max-width: 640px) 100vw, 600px" />
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
        {images.map((src, i) => (
          <div key={i} className="relative aspect-square bg-muted">
            <Image src={src} alt={`image ${i + 1}`} fill className="object-cover" sizes="300px" />
          </div>
        ))}
      </div>
    )
  }

  // 3 or 4 images
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
      {images.slice(0, 4).map((src, i) => (
        <div key={i} className="relative aspect-square bg-muted">
          <Image src={src} alt={`image ${i + 1}`} fill className="object-cover" sizes="300px" />
        </div>
      ))}
    </div>
  )
}
