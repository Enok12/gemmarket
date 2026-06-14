export const dynamic = 'force-dynamic'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { sendOtpEmail } from '@/lib/email'
import { generateOtp } from '@/lib/otp'
import { registerLimiter, checkRateLimit } from '@/lib/ratelimit'


const schema = z.object({
  name:           z.string().min(2, 'Name must be at least 2 characters'),
  email:          z.string().email('Invalid email'),
  password:       z.string().min(8, 'Password must be at least 8 characters'),
  phone:          z.string()
                    .regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code e.g. +94771234567')
                    .optional()
                    .or(z.literal('')),
  primaryContact: z.enum(['WHATSAPP', 'LINE', 'TELEGRAM']).default('WHATSAPP'),
})

export async function POST(req) {
  try {

    // Rate limit check
    const { success, remaining } = await checkRateLimit(registerLimiter, req)
    if (!success) {
      return apiError('Too many registration attempts. Please try again in 1 hour.', 429)
    }

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const { name, email, password, phone, primaryContact } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError('Email already registered', 409)

    const hashed = await bcrypt.hash(password, 12)

    // Create user as unverified
   const user = await prisma.user.create({
    data: {
      name,
      email,
      password:       hashed,
      phone:          phone || null,
      primaryContact: primaryContact || 'WHATSAPP',
      isVerified:     false,
    },
  })

    // Generate OTP and save to DB (expires in 10 minutes)
    const code = generateOtp()
    await prisma.otp.create({
      data: {
        userId:    user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Send OTP email
    await sendOtpEmail(email, name, code)

    return apiSuccess({ userId: user.id, email: user.email }, 201)
  } catch (err) {
    console.error('Register error:', err)
    return apiError('Internal server error', 500)
  }
}