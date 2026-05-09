export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser)             return apiError('Unauthorized', 401)
    if (currentUser.role !== 'ADMIN') return apiError('Forbidden', 403)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page   = parseInt(searchParams.get('page')  || '1')
    const limit  = parseInt(searchParams.get('limit') || '20')
    const skip   = (page - 1) * limit

    const where = status ? { status } : {}

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images:   { take: 1 },
          user:     { select: { id: true, name: true, email: true } },
          tracking: true,
        },
      }),
      prisma.listing.count({ where }),
    ])

    return apiSuccess({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('Admin listings error:', err)
    return apiError('Internal server error', 500)
  }
}
