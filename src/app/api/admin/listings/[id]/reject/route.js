export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { sendPushToUsers } from '@/lib/push'

export async function PATCH(req, { params }) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser)                 return apiError('Unauthorized', 401)
    if (currentUser.role !== 'ADMIN') return apiError('Forbidden', 403)

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return apiError('Listing not found', 404)

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data:  { status: 'REJECTED' },
      include: {
        images: { take: 1 },
        user:   { select: { id: true, name: true, email: true } },
      },
    })

    sendPushToUsers(updated.userId, {
      title: 'Listing needs changes',
      body:  `"${updated.title}" wasn't approved. Open the app to review and resubmit it.`,
      data:  { listingId: updated.id, type: 'LISTING_REJECTED' },
    }).catch(() => {})

    return apiSuccess(updated)
  } catch (err) {
    console.error('Reject error:', err)
    return apiError('Internal server error', 500)
  }
}
