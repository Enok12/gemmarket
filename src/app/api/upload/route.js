export const dynamic = 'force-dynamic'

import { getUserFromRequest } from '@/lib/auth'
import { uploadImage, uploadVideo } from '@/lib/cloudinary'
import { apiSuccess, apiError } from '@/lib/utils'
import { uploadLimiter, checkRateLimit } from '@/lib/ratelimit'

export async function POST(req) {
  try {
    // Rate limit check
    const { success } = await checkRateLimit(uploadLimiter, req)
    if (!success) {
      return apiError('Too many upload attempts. Please try again in 1 hour.', 429)
    }

    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const formData = await req.formData()
    const file     = formData.get('file')
    const type     = formData.get('type') || 'image' // 'image' or 'video'

    if (!file) return apiError('No file provided', 400)

    // Image validation
    if (type === 'image') {
      const maxSize = 10 * 1024 * 1024 // 10 MB
      if (file.size > maxSize) return apiError('Image too large (max 10 MB)', 400)

      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowed.includes(file.type)) {
        return apiError('Invalid image type — use JPEG, PNG or WebP', 400)
      }

      const bytes  = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const { url, publicId } = await uploadImage(buffer, 'gem-market/listings')

      return apiSuccess({ url, publicId, type: 'image' }, 201)
    }

    // Video validation
    if (type === 'video') {
      const maxSize = 50 * 1024 * 1024 // 50 MB
      if (file.size > maxSize) return apiError('Video too large (max 50 MB)', 400)

      const allowed = ['video/mp4', 'video/quicktime', 'video/avi', 'video/webm', 'video/mov']
      if (!allowed.includes(file.type)) {
        return apiError('Invalid video type — use MP4, MOV, AVI or WebM', 400)
      }

      const bytes  = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const { url, publicId } = await uploadVideo(buffer, 'gem-market/videos')

      return apiSuccess({ url, publicId, type: 'video' }, 201)
    }

    return apiError('Invalid file type', 400)
  } catch (err) {
    console.error('Upload error:', err)
    return apiError('Upload failed', 500)
  }
}