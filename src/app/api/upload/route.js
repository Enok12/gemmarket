import { getUserFromRequest } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const formData = await req.formData()
    const file     = formData.get('file')

    if (!file) return apiError('No file provided', 400)

    const maxSize = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxSize) return apiError('File too large (max 10 MB)', 400)

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      return apiError('Invalid file type — use JPEG, PNG or WebP', 400)
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const { url, publicId } = await uploadImage(buffer, 'gem-market/listings')

    return apiSuccess({ url, publicId }, 201)
  } catch (err) {
    console.error('Upload error:', err)
    return apiError('Upload failed', 500)
  }
}
