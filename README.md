# MyLink Blog

```
╔╦╗╦ ╦╦  ╦╔╗╔╦╔═  ╔╗ ╦  ╔═╗╔═╗
║║║╚╦╝║  ║║║║╠╩╗  ╠╩╗║  ║ ║║ ╦
╩ ╩ ╩ ╩═╝╩╝╚╝╩ ╩  ╚═╝╩═╝╚═╝╚═╝
```

> Nền tảng blog cá nhân hiện đại — viết bài, chia sẻ trạng thái, tương tác cộng đồng.

---

## Giới thiệu

**MyLink Blog** là một nền tảng blog full-stack được xây dựng bằng Next.js 14 và Supabase. Dự án hướng tới trải nghiệm đọc/viết mượt mà với giao diện lấy cảm hứng từ Facebook, hỗ trợ bài viết dài dạng rich text, bảng tin trạng thái ngắn, bình luận, lượt thích, phân loại danh mục và trang quản trị đầy đủ chức năng.

---

## Tech Stack

| Công nghệ | Mô tả |
|---|---|
| [Next.js 14](https://nextjs.org) | App Router, SSR/SSG, API Routes |
| [Supabase](https://supabase.com) | PostgreSQL, Auth, Storage |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com) | Component library (Radix UI) |
| [Tiptap](https://tiptap.dev) | Rich text editor |
| [Framer Motion](https://www.framer.com/motion) | Animation |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form & validation |
| [TypeScript](https://www.typescriptlang.org) | Type safety |

---

## Tính năng

### Phía người đọc

- Trang chủ với bài viết nổi bật và danh sách bài mới nhất
- Bảng tin trạng thái (status feed) — chia sẻ bài viết ngắn kiểu mạng xã hội
- Đọc bài viết chi tiết với rich text (heading, code block, image, link...)
- Bình luận bài viết và trạng thái
- Lượt thích bài viết / trạng thái
- Tìm kiếm bài viết
- Duyệt theo danh mục
- Trang hồ sơ người dùng (`/nguoi-dung/[username]`)
- Chia sẻ bài viết lên mạng xã hội
- Responsive, dark mode

### Phía quản trị (`/admin`)

- Thống kê tổng quan (bài viết, bình luận, lượt xem)
- Quản lý bài viết: tạo mới, chỉnh sửa, xoá
- Rich text editor Tiptap với đếm ký tự, highlight, code syntax
- Quản lý danh mục: tạo, đổi tên, xoá
- Quản lý bình luận: duyệt, xoá
- Upload ảnh bìa lên Supabase Storage

---

## Screenshots

> _Chèn ảnh chụp màn hình vào đây._

| Trang chủ | Trang bài viết | Admin |
|---|---|---|
| ![home](docs/screenshots/home.png) | ![post](docs/screenshots/post.png) | ![admin](docs/screenshots/admin.png) |

---

## Cài đặt

### Yêu cầu

- Node.js >= 18
- npm hoặc pnpm
- Tài khoản [Supabase](https://supabase.com) (free tier là đủ)

### Clone & cài dependencies

```bash
git clone https://github.com/your-username/mylink-blog.git
cd mylink-blog
npm install
```

### Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Lấy `SUPABASE_URL` và `ANON_KEY` tại **Supabase Dashboard → Settings → API**.

### Chạy migrations

Cài [Supabase CLI](https://supabase.com/docs/guides/cli) nếu chưa có:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Hoặc chạy thủ công các file SQL trong `supabase/migrations/` từ **Supabase Dashboard → SQL Editor**.

### Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## Cấu trúc thư mục

```
mylink-blog/
├── app/
│   ├── (public)/               # Routes công khai
│   │   ├── page.tsx            # Trang chủ
│   │   ├── bai-viet/[slug]/    # Chi tiết bài viết
│   │   ├── bang-tin/           # Bảng tin trạng thái
│   │   ├── danh-muc/[slug]/    # Lọc theo danh mục
│   │   ├── nguoi-dung/[username]/ # Trang hồ sơ
│   │   └── tim-kiem/           # Tìm kiếm
│   ├── admin/                  # Khu vực quản trị (protected)
│   │   ├── page.tsx            # Dashboard
│   │   ├── bai-viet/           # Quản lý bài viết
│   │   ├── danh-muc/           # Quản lý danh mục
│   │   └── binh-luan/          # Quản lý bình luận
│   ├── auth/dang-nhap/         # Trang đăng nhập
│   └── api/                    # API Routes
│       ├── posts/              # Like, view count
│       ├── comments/           # CRUD bình luận
│       ├── views/              # Đếm lượt xem
│       └── upload/             # Upload ảnh
├── components/
│   ├── admin/                  # Components admin
│   ├── blog/                   # Card bài viết, pagination...
│   ├── editor/                 # Tiptap editor
│   ├── feed/                   # Status feed
│   ├── layout/                 # Header, footer, sidebar
│   ├── profile/                # Trang hồ sơ
│   └── ui/                     # shadcn/ui base components
├── lib/
│   └── supabase/               # Supabase client (browser/server/middleware)
├── supabase/
│   └── migrations/             # SQL migration files
└── docs/                       # Tài liệu dự án
```

---

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon/public key Supabase |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL gốc của website (dùng cho sitemap, OG) |

---

## Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **Import Project**
3. Chọn repo `mylink-blog`
4. Thêm 3 biến môi trường ở mục **Environment Variables**
5. Click **Deploy**

> Vercel tự phát hiện Next.js — không cần cấu hình thêm.

---

## License

[MIT](LICENSE) © 2026 MyLink Blog
