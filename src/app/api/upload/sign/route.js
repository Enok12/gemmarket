export const dynamic = 'force-dynamic'

import cloudinary from '@/lib/cloudinary'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { uploadLimiter, checkRateLimit } from '@/lib/ratelimit'

/**
 * Returns a short-lived signature so the browser can upload a file DIRECTLY to
 * Cloudinary (bypassing Vercel's 4.5 MB function-body limit). The API secret
 * never leaves the server — only the signature does.
 */
export async function POST(req) {
  try {
    const { success } = await checkRateLimit(uploadLimiter, req)
    if (!success) return apiError('Too many upload attempts. Please try again in 1 hour.', 429)

    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const { type } = await req.json().catch(() => ({}))
    const isVideo  = type === 'video'

    const timestamp = Math.round(Date.now() / 1000)
    const folder    = isVideo ? 'gem-market/videos' : 'gem-market/listings'

    // Params that must be included in the signature AND sent by the browser,
    // byte-for-byte identical, or Cloudinary rejects the upload.
    const paramsToSign = { timestamp, folder }
    // Resize/optimize images on the way in (matches the old server-side behaviour).
    if (!isVideo) paramsToSign.transformation = 'c_limit,w_1200,h_900,q_auto:good'

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    )

    return apiSuccess({
      signature,
      timestamp,
      folder,
      transformation: paramsToSign.transformation || null,
      apiKey:       process.env.CLOUDINARY_API_KEY,
      cloudName:    process.env.CLOUDINARY_CLOUD_NAME,
      resourceType: isVideo ? 'video' : 'image',
    })
  } catch (err) {
    console.error('Sign upload error:', err)
    return apiError('Could not prepare upload', 500)
  }
}
