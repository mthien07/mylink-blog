-- ============================================
-- Migration: Profile fields, status posts, likes
-- ============================================

-- Add profile fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;

-- Add type and images to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'blog' CHECK (type IN ('blog', 'status'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Make title nullable (status posts don't have titles)
ALTER TABLE public.posts ALTER COLUMN title DROP NOT NULL;

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(type);

-- RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (true);
CREATE POLICY "Auth users can like" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Allow auth users to create/update/delete their own status posts
CREATE POLICY "Auth users can create status posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id AND type = 'status');
CREATE POLICY "Users can update own status posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id AND type = 'status');
CREATE POLICY "Users can delete own status posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id AND type = 'status');

-- Storage bucket for user media (avatars, covers, post images)
INSERT INTO storage.buckets (id, name, public) VALUES ('user-media', 'user-media', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view user media" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-media');
CREATE POLICY "Auth users can upload user media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-media' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own user media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update handle_new_user to auto-generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g')) || '-' || substr(NEW.id::text, 1, 4)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
