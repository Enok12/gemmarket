export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { verifyOtpLimiter, checkRateLimit } from '@/lib/ratelimit'


const schema = z.object({
  userId: z.string().min(1),
  code:   z.string().length(6),
})

export async function POST(req) {
  try {

    // Rate limit check
    const { success } = await checkRateLimit(verifyOtpLimiter, req)
    if (!success) {
      return apiError('Too many verification attempts. Please try again in 1 hour.', 429)
    }
    
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('Invalid code', 422)

    const { userId, code } = parsed.data

    // Find latest unused valid OTP
    const otp = await prisma.otp.findFirst({
      where: {
        userId,
        code,
        used:      false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) return apiError('Invalid or expired code', 400)

    // Mark OTP as used and verify user
    await prisma.otp.update({
      where: { id: otp.id },
      data:  { used: true },
    })

    const user = await prisma.user.update({
      where: { id: userId },
      data:  { isVerified: true },
    })

    // Issue JWT token
    const token = signToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
    })

    return apiSuccess({
      user:  { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return apiError('Internal server error', 500)
  }
}