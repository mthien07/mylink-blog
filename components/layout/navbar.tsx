'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, PenSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/bai-viet', label: 'Bài viết' },
    { href: '/danh-muc', label: 'Danh mục' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight hover:text-primary transition-colors">
          mylink-blog
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/tim-kiem">
            <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Chuyển giao diện">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {user ? (
            <Link href="/admin">
              <Button size="sm" variant="outline" className="hidden md:flex gap-2">
                <PenSquare className="h-3.5 w-3.5" />
                Quản trị
              </Button>
            </Link>
          ) : (
            <Link href="/auth/dang-nhap">
              <Button size="sm" className="hidden md:flex">Đăng nhập</Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">{link.label}</Link>
                ))}
                <hr />
                {user ? (
                  <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors">Quản trị</Link>
                ) : (
                  <Link href="/auth/dang-nhap" className="text-lg font-medium hover:text-primary transition-colors">Đăng nhập</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
