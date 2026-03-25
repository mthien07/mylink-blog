'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { UserProfile } from '@/lib/supabase/profile-queries'

const schema = z.object({
  display_name: z.string().min(1, 'Tên hiển thị không được để trống').max(50),
  username: z
    .string()
    .min(3, 'Tên người dùng ít nhất 3 ký tự')
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Chỉ chứa chữ thường, số và dấu gạch ngang'),
  bio: z.string().max(200, 'Tối đa 200 ký tự').optional(),
  website: z.string().max(100).optional(),
  location: z.string().max(50).optional(),
})

type FormValues = z.infer<typeof schema>

interface ProfileEditDialogProps {
  open: boolean
  onClose: () => void
  user: UserProfile
}

export function ProfileEditDialog({ open, onClose, user }: ProfileEditDialogProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: user.display_name || '',
      username: user.username || '',
      bio: user.bio || '',
      website: user.website || '',
      location: user.location || '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({
          display_name: values.display_name,
          username: values.username,
          bio: values.bio || null,
          website: values.website || null,
          location: values.location || null,
        })
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') {
          toast.error('Tên người dùng đã được sử dụng')
        } else {
          toast.error('Có lỗi xảy ra, vui lòng thử lại')
        }
        return
      }

      toast.success('Hồ sơ đã được cập nhật')
      onClose()
      router.refresh()
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Tên hiển thị</Label>
            <Input id="display_name" {...register('display_name')} />
            {errors.display_name && <p className="text-xs text-destructive">{errors.display_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Tên người dùng</Label>
            <Input id="username" {...register('username')} placeholder="vi-du-ten" />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Giới thiệu</Label>
            <Textarea id="bio" {...register('bio')} rows={3} className="resize-none" placeholder="Vài dòng về bạn..." />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} placeholder="https://example.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Vị trí</Label>
            <Input id="location" {...register('location')} placeholder="Hà Nội, Việt Nam" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
