'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import type { Post, Category } from '@/lib/types'

const postSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200),
  slug: z.string().min(1, 'Vui lòng nhập slug'),
  excerpt: z.string().max(500).optional(),
  thumbnail_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  category_id: z.string().optional(),
  status: z.enum(['draft', 'published']),
})

type PostFormData = z.infer<typeof postSchema>

interface PostFormProps {
  post?: Post
  categories: Category[]
}

export function PostForm({ post, categories }: PostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState(post?.content || '')
  const [saving, setSaving] = useState(false)

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      thumbnail_url: post?.thumbnail_url || '',
      category_id: post?.category_id || '',
      status: post?.status || 'draft',
    },
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    form.setValue('title', title)
    if (!post) form.setValue('slug', slugify(title))
  }

  const onSubmit = async (data: PostFormData) => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Vui lòng đăng nhập lại'); setSaving(false); return }

    const payload = {
      ...data,
      content,
      category_id: data.category_id || null,
      thumbnail_url: data.thumbnail_url || null,
      excerpt: data.excerpt || null,
      author_id: user.id,
      published_at: data.status === 'published' ? (post?.published_at || new Date().toISOString()) : null,
    }

    const { error } = post
      ? await supabase.from('posts').update(payload).eq('id', post.id)
      : await supabase.from('posts').insert(payload)

    if (error) {
      toast.error(error.message.includes('slug') ? 'Slug đã tồn tại, vui lòng đổi khác' : 'Có lỗi xảy ra')
    } else {
      toast.success(post ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết mới')
      router.push('/admin/bai-viet')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input id="title" {...form.register('title')} onChange={handleTitleChange} placeholder="Nhập tiêu đề bài viết" className="mt-1 text-lg" />
            {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...form.register('slug')} placeholder="url-bai-viet" className="mt-1 font-mono text-sm" />
            {form.formState.errors.slug && <p className="text-red-500 text-xs mt-1">{form.formState.errors.slug.message}</p>}
          </div>

          <div>
            <Label>Nội dung *</Label>
            <div className="mt-1">
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm">Xuất bản</h3>

            <div>
              <Label>Trạng thái</Label>
              <Select defaultValue={form.getValues('status')} onValueChange={v => form.setValue('status', v as 'draft' | 'published')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="published">Công bố</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Danh mục</Label>
              <Select defaultValue={form.getValues('category_id') ?? 'none'} onValueChange={v => form.setValue('category_id', v === 'none' || !v ? '' : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có danh mục</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Đang lưu...' : post ? 'Cập nhật' : 'Tạo bài viết'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm">Thumbnail</h3>
            <div>
              <Input {...form.register('thumbnail_url')} placeholder="https://..." className="text-sm" />
              {form.watch('thumbnail_url') && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.watch('thumbnail_url')} alt="preview" className="mt-2 rounded-md w-full h-32 object-cover" />
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm">Mô tả ngắn</h3>
            <Textarea {...form.register('excerpt')} placeholder="Mô tả ngắn về bài viết..." rows={4} className="text-sm resize-none" />
          </div>
        </div>
      </div>
    </form>
  )
}
