export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { deleteImage, deleteVideo } from '@/lib/cloudinary'
import { apiSuccess, apiError } from '@/lib/utils'

const schema = z.object({
  publicId:     z.string().min(1),
  resourceType: z.enum(['image', 'video']).default('image'),
})

/**
 * Deletes a freshly-uploaded asset from Cloudinary — called when a user removes
 * an image/video they just added to a listing form, so abandoned uploads don't
 * pile up. Restricted to our own folders so nothing else can be touched.
 */
export async function POST(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('Invalid request', 422)

    const { publicId, resourceType } = parsed.data

    // Safety: only assets inside our own upload folders may be deleted here.
    if (!publicId.startsWith('gem-market/')) return apiError('Forbidden', 403)

    if (resourceType === 'video') await deleteVideo(publicId)
    else                          await deleteImage(publicId)

    return apiSuccess({ deleted: true })
  } catch (err) {
    console.error('Delete asset error:', err)
    return apiError('Delete failed', 500)
  }
}
