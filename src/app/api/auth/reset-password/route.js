export const dynamic = 'force-dynamic'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

const schema = z.object({
  userId:      z.string().min(1),
  code:        z.string().length(6),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const { userId, code, newPassword } = parsed.data

    // Find valid unused OTP
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

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otp.id },
      data:  { used: true },
    })

    // Hash new password and update user
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data:  { password: hashed },
    })

    return apiSuccess({ message: 'Password reset successfully' })
  } catch (err) {
    console.error('Reset password error:', err)
    return apiError('Internal server error', 500)
  }
}