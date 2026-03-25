import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Link href="/" className="font-bold text-lg">mylink-blog</Link>
            <p className="text-sm text-muted-foreground mt-1">Chia sẻ kiến thức và kinh nghiệm</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/bai-viet" className="hover:text-foreground transition-colors">Bài viết</Link>
            <Link href="/danh-muc" className="hover:text-foreground transition-colors">Danh mục</Link>
            <Link href="/tim-kiem" className="hover:text-foreground transition-colors">Tìm kiếm</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} mylink-blog. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}
