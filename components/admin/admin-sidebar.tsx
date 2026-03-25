'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Tag, MessageCircle, LogOut, PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bai-viet', label: 'Bài viết', icon: FileText },
  { href: '/admin/danh-muc', label: 'Danh mục', icon: Tag },
  { href: '/admin/binh-luan', label: 'Bình luận', icon: MessageCircle },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Đã đăng xuất')
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full shrink-0">
      <div className="p-6 border-b">
        <Link href="/" className="font-bold text-lg">mylink-blog</Link>
        <p className="text-xs text-muted-foreground mt-0.5">Quản trị</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link href="/admin/bai-viet/tao-moi">
          <Button size="sm" className="w-full gap-2">
            <PenSquare className="h-3.5 w-3.5" />
            Viết bài mới
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
