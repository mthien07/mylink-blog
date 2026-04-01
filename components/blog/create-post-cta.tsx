'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ImageIcon, Link2, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { User } from '@/lib/types'

export function CreatePostCTA() {
  const [profile, setProfile] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profileData } = await supabase
        .from('users')
        .select('id, display_name, username, avatar_url, role, email, bio, cover_url, website, location, created_at')
        .eq('id', data.user.id)
        .maybeSingle()
      if (profileData) setProfile(profileData as User)
    })
  }, [])

  const handleClick = () => {
    router.push(profile ? '/admin/bai-viet/tao-moi' : '/auth/dang-nhap')
  }

  const displayName = profile?.display_name || 'Bạn'
  const avatarUrl = profile?.avatar_url || ''

  return (
    <div className="bg-card rounded-xl border p-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-xs bg-muted">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <button
          onClick={handleClick}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-muted hover:bg-accent transition-colors text-sm text-muted-foreground"
        >
          {profile ? `${displayName} ơi, bạn đang nghĩ gì?` : 'Bạn đang nghĩ gì?'}
        </button>
      </div>
      <div className="border-t mt-3 pt-2 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-red-500 flex-1 h-9"
        >
          <Video className="h-4 w-4 text-red-500" />
          Video
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-green-600 flex-1 h-9"
        >
          <ImageIcon className="h-4 w-4 text-green-500" />
          Ảnh
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary flex-1 h-9"
        >
          <Link2 className="h-4 w-4 text-primary" />
          Bài viết
        </Button>
      </div>
    </div>
  )
}
