export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { issueVerification } from '@/lib/otp'
import { resendOtpLimiter, checkRateLimit } from '@/lib/ratelimit'


const schema = z.object({ userId: z.string().min(1) })

export async function POST(req) {
  try {

     // Rate limit check
    const { success } = await checkRateLimit(resendOtpLimiter, req)
    if (!success) {
      return apiError('Too many resend attempts. Please try again in 1 hour.', 429)
    }
    
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('Invalid request', 422)

    const { userId } = parsed.data

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user)           return apiError('User not found', 404)
    if (user.isVerified) return apiError('Already verified', 400)

    // Invalidate all existing unused OTPs (both code and link tokens)
    await prisma.otp.updateMany({
      where: { userId, used: false },
      data:  { used: true },
    })

    // Issue a fresh verification link + code (valid 1 hour)
    await issueVerification(user)

    return apiSuccess({ message: 'Verification link resent successfully' })
  } catch (err) {
    console.error('Resend OTP error:', err)
    return apiError('Internal server error', 500)
  }
}