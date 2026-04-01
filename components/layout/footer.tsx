import Link from 'next/link'
import { X, Globe, Rss } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t mt-auto bg-muted/20">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="font-bold text-lg hover:text-primary transition-colors">
              mylink-blog
            </Link>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
              Nơi chia sẻ kiến thức, kinh nghiệm và những điều thú vị về công nghệ và cuộc sống.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-medium text-sm mb-3">Điều hướng</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/bai-viet" className="hover:text-foreground transition-colors">Bài viết</Link></li>
              <li><Link href="/danh-muc" className="hover:text-foreground transition-colors">Danh mục</Link></li>
              <li><Link href="/bang-tin" className="hover:text-foreground transition-colors">Bảng tin</Link></li>
              <li><Link href="/tim-kiem" className="hover:text-foreground transition-colors">Tìm kiếm</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="font-medium text-sm mb-3">Kết nối</p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="X (Twitter)"
              >
                <X className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="GitHub"
              >
                <Globe className="h-4 w-4" />
              </a>
              <Link
                href="/bai-viet"
                className="p-2 rounded-md bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Bài viết"
              >
                <Rss className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 text-center text-xs text-muted-foreground">
          © {year} mylink-blog. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  )
}
