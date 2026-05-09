import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page  = parseInt(searchParams.get('page')  || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip  = (page - 1) * limit

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where:   { userId: currentUser.userId },
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: { images: { take: 1 }, tracking: true },
      }),
      prisma.listing.count({ where: { userId: currentUser.userId } }),
    ])

    return apiSuccess({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('Get my listings error:', err)
    return apiError('Internal server error', 500)
  }
}
