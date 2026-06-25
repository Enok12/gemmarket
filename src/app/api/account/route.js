export const dynamic = 'force-dynamic'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

// GET /api/account — fetch current user details
export async function GET(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id:             true,
        name:           true,
        email:          true,
        phone:          true,
        whatsapp:       true,
        telegram:       true,
        line:           true,
        primaryContact: true,
        role:           true,
        isVerified:     true,
        createdAt:      true,
        listings:  {
          select: {
            id:       true,
            status:   true,
            tracking: { select: { whatsappClicks: true } },
          },
        },
      },
    })

    if (!user) return apiError('User not found', 404)

    // Calculate stats
    const stats = {
      totalListings:   user.listings.length,
      liveListings:    user.listings.filter((l) => l.status === 'APPROVED').length,
      pendingListings: user.listings.filter((l) => l.status === 'PENDING').length,
      whatsappClicks:  user.listings.reduce((s, l) => s + (l.tracking?.whatsappClicks ?? 0), 0),
    }

    return apiSuccess({ ...user, stats })
  } catch (err) {
    console.error('Get account error:', err)
    return apiError('Internal server error', 500)
  }
}

// PATCH /api/account — update profile
export async function PATCH(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const body = await req.json()

    // Handle profile update
   if (body.type === 'profile') {
      const schema = z.object({
        name:     z.string().min(2, 'Name must be at least 2 characters'),
        phone:    z.string()
                  .regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code e.g. +94771234567')
                  .optional()
                  .or(z.literal('')),
        whatsapp: z.string()
                  .regex(/^\+[1-9]\d{6,14}$/, 'WhatsApp must include country code e.g. +94771234567')
                  .optional()
                  .or(z.literal('')),
        telegram: z.string()
                  .regex(/^@?[a-zA-Z0-9_]{4,32}$/, 'Enter a valid Telegram username e.g. @username')
                  .optional()
                  .or(z.literal(''))
                  .nullable(),
        line:           z.string()
                          .min(4, 'Line ID must be at least 4 characters')
                          .optional()
                          .or(z.literal(''))
                          .nullable(),
        primaryContact: z.enum(['WHATSAPP', 'LINE', 'TELEGRAM']).optional(),
      })

      const parsed = schema.safeParse(body)
      if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

      const updated = await prisma.user.update({
        where: { id: currentUser.userId },
        data: {
          name:           parsed.data.name,
          phone:          parsed.data.phone          || null,
          whatsapp:       parsed.data.whatsapp       || null,
          telegram:       parsed.data.telegram       || null,
          line:           parsed.data.line           || null,
          ...(parsed.data.primaryContact && { primaryContact: parsed.data.primaryContact }),
        },
        select: {
          id: true, name: true, email: true,
          phone: true, whatsapp: true, telegram: true, line: true,
          primaryContact: true, role: true,
        },
      })

      return apiSuccess(updated)
    }

    // Handle password change
    if (body.type === 'password') {
      const schema = z.object({
        currentPassword: z.string().min(1),
        newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
      })

      const parsed = schema.safeParse(body)
      if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

      const user = await prisma.user.findUnique({
        where: { id: currentUser.userId },
      })

      const match = await bcrypt.compare(parsed.data.currentPassword, user.password)
      if (!match) return apiError('Current password is incorrect', 400)

      const hashed = await bcrypt.hash(parsed.data.newPassword, 12)

      await prisma.user.update({
        where: { id: currentUser.userId },
        data:  { password: hashed },
      })

      return apiSuccess({ message: 'Password updated successfully' })
    }

    return apiError('Invalid request type', 400)
  } catch (err) {
    console.error('Update account error:', err)
    return apiError('Internal server error', 500)
  }
}