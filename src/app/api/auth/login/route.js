export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { loginLimiter, checkRateLimit } from '@/lib/ratelimit'
import { generateOtp } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/email'


const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req) {
  try {

    // Rate limit check
    const { success } = await checkRateLimit(loginLimiter, req)
    if (!success) {
      return apiError('Too many login attempts. Please try again in 1 hour.', 429)
    }
    
    const body   = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) return apiError('Invalid email or password', 422)

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return apiError('Invalid email or password', 401)

    const match = await bcrypt.compare(password, user.password)
    if (!match) return apiError('Invalid email or password', 401)

      // Unverified user with correct credentials: re-issue a fresh code and
      // route them back to the verification screen (they may have lost the
      // original /verify link by closing the app before entering the code).
      if (!user.isVerified) {
        const code = generateOtp()
        await prisma.otp.create({
          data: { userId: user.id, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        })
        try {
          await sendOtpEmail(user.email, user.name, code)
        } catch (e) {
          console.error('Resend OTP email failed on login:', e)
        }
        return NextResponse.json(
          {
            success: false,
            needsVerification: true,
            userId: user.id,
            error: "Please verify your email. We've sent a new code to your inbox.",
          },
          { status: 403 }
        )
      }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, primaryContact: user.primaryContact },
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    return apiError('Internal server error', 500)
  }
}
