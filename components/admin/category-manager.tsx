'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trash2, Pencil, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { slugify, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Category } from '@/lib/types'

interface CategoryManagerProps {
  initialCategories: Category[]
}

interface CategoryForm {
  name: string
  slug: string
  description: string
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CategoryForm>({ name: '', slug: '', description: '' })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '' })
    setOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' })
    setOpen(true)
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: editing ? f.slug : slugify(name) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return }
    setSaving(true)
    const supabase = createClient()
    const payload = { name: form.name.trim(), slug: form.slug.trim() || slugify(form.name), description: form.description.trim() || null }

    const { error } = editing
      ? await supabase.from('categories').update(payload).eq('id', editing.id)
      : await supabase.from('categories').insert(payload)

    if (error) {
      toast.error(error.message.includes('unique') ? 'Tên hoặc slug đã tồn tại' : 'Có lỗi xảy ra')
    } else {
      toast.success(editing ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục mới')
      setOpen(false)
      router.refresh()
      // Optimistic update
      if (editing) {
        setCategories(cs => cs.map(c => c.id === editing.id ? { ...c, ...payload } : c))
      }
    }
    setSaving(false)
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Xóa danh mục "${cat.name}"? Các bài viết trong danh mục này sẽ không bị xóa.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) toast.error('Có lỗi khi xóa')
    else {
      toast.success('Đã xóa danh mục')
      setCategories(cs => cs.filter(c => c.id !== cat.id))
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Thêm danh mục</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Chưa có danh mục nào.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tên</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Slug</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Mô tả</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Ngày tạo</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm">{cat.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs font-mono text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{cat.description || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{formatDate(cat.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(cat)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên *</Label>
              <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Tên danh mục" className="mt-1" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ten-danh-muc" className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả ngắn về danh mục..." rows={3} className="mt-1 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
