import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, buildWhatsAppLink } from '@/lib/utils'

const schema = z.object({ listingId: z.string().min(1) })

export async function POST(req) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('listingId is required', 422)

    const { listingId } = parsed.data

    const listing = await prisma.listing.findUnique({
      where:  { id: listingId },
      select: { id: true, title: true, whatsappNumber: true, status: true },
    })

    if (!listing)                      return apiError('Listing not found', 404)
    if (listing.status !== 'APPROVED') return apiError('Listing not available', 403)

    // Increment click counter
    await prisma.tracking.upsert({
      where:  { listingId },
      update: { whatsappClicks: { increment: 1 } },
      create: { listingId, whatsappClicks: 1 },
    })

    const whatsappUrl = buildWhatsAppLink(listing.whatsappNumber, listing.title)

    return apiSuccess({ whatsappUrl })
  } catch (err) {
    console.error('Track click error:', err)
    return apiError('Internal server error', 500)
  }
}
