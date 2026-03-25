'use client'
import { useState, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { toggleLike } from '@/lib/supabase/like-queries'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialCount?: number
  initialLiked?: boolean
}

export function LikeButton({ postId, initialCount = 0, initialLiked = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(async () => {
    if (loading) return

    // Check auth first
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích bài viết')
      return
    }

    // Debounce rapid clicks
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Optimistic update
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const result = await toggleLike(postId)
        setLiked(result.liked)
        setCount(result.count)
      } catch {
        // Revert on error
        setLiked(prevLiked)
        setCount(prevCount)
        toast.error('Có lỗi xảy ra, vui lòng thử lại')
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [liked, count, loading, postId])

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors',
        liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
      )}
      aria-label={liked ? 'Bỏ thích' : 'Thích'}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={liked ? 'liked' : 'unliked'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.15, type: 'spring', stiffness: 400 }}
        >
          <Heart
            className={cn('h-4 w-4', liked && 'fill-red-500 stroke-red-500')}
          />
        </motion.span>
      </AnimatePresence>
      <span>{count}</span>
    </button>
  )
}
