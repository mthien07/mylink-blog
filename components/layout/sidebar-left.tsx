import Link from 'next/link'
import { Home, BookOpen, Grid3X3, Rss, Tag, ChevronRight } from 'lucide-react'
import { getCategories } from '@/lib/supabase/queries'

export async function SidebarLeft() {
  const categories = await getCategories()

  const navLinks = [
    { href: '/', icon: Home, label: 'Trang chủ' },
    { href: '/bai-viet', icon: BookOpen, label: 'Bài viết' },
    { href: '/bang-tin', icon: Rss, label: 'Bảng tin' },
    { href: '/danh-muc', icon: Grid3X3, label: 'Danh mục' },
  ]

  return (
    <div className="sticky top-[60px] space-y-1 pb-4">
      {/* Navigation shortcuts */}
      <nav className="space-y-0.5">
        {navLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t my-2" />

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
          Danh mục phổ biến
        </p>
        <div className="space-y-0.5">
          {categories.slice(0, 8).map(cat => (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Tag className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="flex-1 truncate">{cat.name}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
        {categories.length > 8 && (
          <Link
            href="/danh-muc"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-primary font-medium"
          >
            Xem tất cả →
          </Link>
        )}
      </div>
    </div>
  )
}
