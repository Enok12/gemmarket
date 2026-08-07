export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

const schema = z.object({
  token:    z.string().min(1),
  platform: z.string().default('android'),
})

/** Saves (or refreshes) this device's FCM token against the logged-in user. */
export async function POST(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return apiError('Invalid request', 422)

    const { token, platform } = parsed.data

    // A device token is globally unique; re-registering may move it to a
    // different user (e.g. someone else signs in on the same phone).
    await prisma.deviceToken.upsert({
      where:  { token },
      update: { userId: currentUser.userId, platform },
      create: { token, platform, userId: currentUser.userId },
    })

    return apiSuccess({ registered: true })
  } catch (err) {
    console.error('Push register error:', err)
    return apiError('Could not register device', 500)
  }
}

/** Removes this device's token — called on logout so pushes stop. */
export async function DELETE(req) {
  try {
    const parsed = schema.partial().safeParse(await req.json())
    if (!parsed.success || !parsed.data.token) return apiError('Invalid request', 422)

    await prisma.deviceToken.deleteMany({ where: { token: parsed.data.token } })
    return apiSuccess({ removed: true })
  } catch (err) {
    console.error('Push unregister error:', err)
    return apiError('Could not remove device', 500)
  }
}
