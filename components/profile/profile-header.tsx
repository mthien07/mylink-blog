'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Globe, Calendar, FileText, Heart, Pencil } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { ProfileEditDialog } from './profile-edit-dialog'
import type { UserProfile } from '@/lib/supabase/profile-queries'

interface ProfileHeaderProps {
  user: UserProfile
  isOwner: boolean
}

export function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false)
  const displayName = user.display_name || user.email

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
        {user.cover_url ? (
          <Image src={user.cover_url} alt="Ảnh bìa" fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-muted" />
        )}
      </div>

      {/* Profile info */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="relative pb-4">
          {/* Avatar positioned over cover */}
          <div className="absolute -top-[60px] left-0">
            <Avatar className="h-[120px] w-[120px] border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar_url || ''} alt={displayName || ''} />
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(displayName || 'U')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Edit button */}
          {isOwner && (
            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          )}

          {/* Name & username */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            {user.username && (
              <p className="text-muted-foreground text-sm mt-0.5">@{user.username}</p>
            )}
            {user.bio && (
              <p className="text-sm mt-3 leading-relaxed max-w-xl">{user.bio}</p>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Tham gia {formatDate(user.created_at)}
            </span>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{user.post_count}</span>
              <span className="text-muted-foreground">bài viết</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{user.total_likes}</span>
              <span className="text-muted-foreground">lượt thích</span>
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <ProfileEditDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} />
      )}
    </motion.div>
  )
}
