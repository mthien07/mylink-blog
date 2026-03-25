'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { uploadMultipleImages } from '@/lib/upload-image'
import { getInitials } from '@/lib/utils'
import type { Post, User } from '@/lib/types'

interface StatusComposerProps {
  currentUser: User
  onPostCreated: (post: Post) => void
}

const MAX_IMAGES = 4

export function StatusComposer({ currentUser, onPostCreated }: StatusComposerProps) {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [previewImages, setPreviewImages] = useState<{ file: File; url: string }[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_IMAGES - previewImages.length
    const toAdd = files.slice(0, remaining)
    const previews = toAdd.map(file => ({ file, url: URL.createObjectURL(file) }))
    setPreviewImages(prev => [...prev, ...previews])
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setPreviewImages(prev => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    if (!content.trim() && previewImages.length === 0) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { toast.error('Vui lòng đăng nhập'); return }

      let imageUrls: string[] = []
      if (previewImages.length > 0) {
        imageUrls = await uploadMultipleImages(previewImages.map(p => p.file), authUser.id)
      }

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          slug: `status-${crypto.randomUUID().slice(0, 8)}`,
          content: content.trim(),
          images: imageUrls,
          author_id: authUser.id,
          type: 'status',
          status: 'published',
          published_at: new Date().toISOString(),
          title: null,
          excerpt: null,
          thumbnail_url: null,
          category_id: null,
          view_count: 0,
        })
        .select('*')
        .single()

      if (error) throw error

      const newPost: Post = {
        ...(post as Post),
        author: currentUser,
        like_count: 0,
        comment_count: 0,
        liked_by_user: false,
      }

      onPostCreated(newPost)
      toast.success('Đã đăng bài viết!')
      setContent('')
      setPreviewImages([])
      setExpanded(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (!expanded) {
    return (
      <div
        className="bg-card border rounded-xl p-4 mb-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(true)}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={currentUser.avatar_url || ''} />
          <AvatarFallback>{getInitials(currentUser.display_name || currentUser.email)}</AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground text-sm flex-1">Bạn đang nghĩ gì?</span>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-xl p-4 mb-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={currentUser.avatar_url || ''} />
          <AvatarFallback>{getInitials(currentUser.display_name || currentUser.email)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{currentUser.display_name || currentUser.email}</span>
      </div>

      <Textarea
        autoFocus
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Bạn đang nghĩ gì?"
        rows={3}
        className="resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0 shadow-none"
      />

      {previewImages.length > 0 && (
        <ImagePreviewGrid images={previewImages} onRemove={removeImage} />
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={previewImages.length >= MAX_IMAGES}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={previewImages.length >= MAX_IMAGES || loading}
            className="text-muted-foreground"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Ảnh
          </Button>
          {previewImages.length > 0 && (
            <span className="text-xs text-muted-foreground">{previewImages.length}/{MAX_IMAGES}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setExpanded(false); setContent(''); setPreviewImages([]) }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && previewImages.length === 0)}
          >
            {loading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Đang đăng...</> : 'Đăng'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Inline preview grid for selected images before posting */
function ImagePreviewGrid({ images, onRemove }: { images: { url: string }[]; onRemove: (i: number) => void }) {
  return (
    <div className={`grid gap-1 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {images.map((img, i) => (
        <div key={i} className="relative rounded-md overflow-hidden aspect-square bg-muted">
          <Image src={img.url} alt={`preview-${i}`} fill className="object-cover" sizes="200px" />
          <button type="button" onClick={() => onRemove(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
