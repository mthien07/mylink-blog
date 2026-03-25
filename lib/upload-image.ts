import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const BUCKET = 'user-media'

function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Loại file không được hỗ trợ: ${file.type}. Chỉ chấp nhận JPEG, PNG, GIF, WebP.`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File quá lớn: ${(file.size / 1024 / 1024).toFixed(1)}MB. Tối đa 5MB.`)
  }
}

function getExtension(file: File): string {
  const parts = file.name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg'
}

/**
 * Upload a single image to Supabase Storage.
 * @param file - The file to upload
 * @param path - Full storage path e.g. `userId/posts/filename.jpg`
 * @returns Public URL of the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  validateFile(file)

  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(`Lỗi tải ảnh lên: ${error.message}`)

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

/**
 * Upload multiple images in parallel for a user's posts.
 * @param files - Array of image files (up to 4)
 * @param userId - Authenticated user ID
 * @returns Array of public URLs in the same order as input files
 */
export async function uploadMultipleImages(files: File[], userId: string): Promise<string[]> {
  if (files.length === 0) return []

  const timestamp = Date.now()
  const uploads = files.map((file, index) => {
    const ext = getExtension(file)
    const path = `${userId}/posts/${timestamp}-${index}.${ext}`
    return uploadImage(file, path)
  })

  return Promise.all(uploads)
}
