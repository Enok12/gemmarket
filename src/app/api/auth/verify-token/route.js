export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { verifyOtpLimiter, checkRateLimit } from '@/lib/ratelimit'

const schema = z.object({ token: z.string().min(1) })

export async function POST(req) {
  try {
    const { success } = await checkRateLimit(verifyOtpLimiter, req)
    if (!success) return apiError('Too many verification attempts. Please try again in 1 hour.', 429)

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('Invalid verification link', 422)

    const { token } = parsed.data

    // Find the matching, unused, unexpired verification token.
    const otp = await prisma.otp.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      // Already-used token whose user is verified → treat as success (idempotent).
      const usedOtp = await prisma.otp.findUnique({ where: { token } })
      if (usedOtp) {
        const u = await prisma.user.findUnique({ where: { id: usedOtp.userId } })
        if (u?.isVerified) {
          const jwt = signToken({ userId: u.id, email: u.email, role: u.role })
          return apiSuccess({ user: { id: u.id, name: u.name, email: u.email, role: u.role }, token: jwt })
        }
      }
      return apiError('This verification link is invalid or has expired.', 400)
    }

    await prisma.otp.update({ where: { id: otp.id }, data: { used: true } })
    const user = await prisma.user.update({
      where: { id: otp.userId },
      data:  { isVerified: true },
    })

    const jwt = signToken({ userId: user.id, email: user.email, role: user.role })
    return apiSuccess({
      user:  { id: user.id, name: user.name, email: user.email, role: user.role },
      token: jwt,
    })
  } catch (err) {
    console.error('Verify token error:', err)
    return apiError('Internal server error', 500)
  }
}
