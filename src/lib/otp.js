import crypto from 'crypto'
import { prisma } from './prisma'
import { sendVerificationEmail } from './email'

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Long, unguessable token embedded in the verification link.
export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Creates a fresh verification OTP (6-digit code + link token, valid 1 hour)
 * for a user and emails them the verification link + code. Used by register,
 * login (unverified re-issue), and resend-otp so the logic lives in one place.
 */
export async function issueVerification(user) {
  const code  = generateOtp()
  const token = generateToken()
  await prisma.otp.create({
    data: {
      userId:    user.id,
      code,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })
  await sendVerificationEmail(user.email, user.name, code, token)
  return { code, token }
}
