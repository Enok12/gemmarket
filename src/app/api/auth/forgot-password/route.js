export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { sendPasswordResetEmail } from '@/lib/email'
import { generateOtp } from '@/lib/otp'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success even if email not found
    // This prevents email enumeration attacks
    if (!user) {
      return apiSuccess({ message: 'If this email exists you will receive a reset code' })
    }

    // Invalidate all existing unused OTPs for this user
    await prisma.otp.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    })

    // Generate new OTP
    const code = generateOtp()
    await prisma.otp.create({
      data: {
        userId:    user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Send password reset email
    await sendPasswordResetEmail(email, user.name, code)

    return apiSuccess({
      message: 'If this email exists you will receive a reset code',
      userId:  user.id,
    })
  } catch (err) {
    console.error('Forgot password error:', err)
    return apiError('Internal server error', 500)
  }
}