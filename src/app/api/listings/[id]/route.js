export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

const updateSchema = z.object({
  title:          z.string().min(5).optional(),
  price:          z.number().positive().nullable().optional(),
  gemType:        z.string().optional(),
  stoneType:      z.enum(['ROUGH', 'CUT_AND_POLISHED']).optional(),
  carat:          z.number().positive().optional(),
  color:          z.string().optional(),
  clarity:        z.string().optional(),
  cut:            z.string().min(1).optional(),
  treatment:      z.string().optional(),
  origin:         z.string().optional(),
  description:    z.string().min(20).optional(),
  whatsappNumber: z.string().optional(),
  telegram: z.string().nullable().optional().transform(v => v || null),
  line:     z.string().nullable().optional().transform(v => v || null),
  location:       z.string().optional(),
  country:        z.string().min(1).optional(),
  city:           z.string().min(1).optional(),
  certification:  z.string().optional(),
  certificationImage: z.string().optional(),
    availability:   z.enum(['Available', 'Sold']).optional(),
  images: z.array(                            
    z.object({ imageUrl: z.string(), publicId: z.string().optional() })
  ).optional(),
    videos: z.array(
    z.object({ videoUrl: z.string(), publicId: z.string().optional() })
  ).optional(),
})

export async function GET(req, { params }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        images:   true,
        videos:   true,
        user:     { select: { id: true, name: true } },
        tracking: true,
      },
    })
    if (!listing) return apiError('Listing not found', 404)
    return apiSuccess(listing)
  } catch (err) {
    console.error('Get listing error:', err)
    return apiError('Internal server error', 500)
  }
}

export async function PATCH(req, { params }) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return apiError('Listing not found', 404)

    const isOwner = listing.userId === currentUser.userId
    const isAdmin = currentUser.role === 'ADMIN'
    if (!isOwner && !isAdmin) return apiError('Forbidden', 403)

    const body   = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    // Enforce the owner's primary contact channel (skipped when an admin edits
    // someone else's listing, since it isn't their preference).
    if (isOwner && ('whatsappNumber' in parsed.data || 'telegram' in parsed.data || 'line' in parsed.data)) {
      const seller = await prisma.user.findUnique({
        where:  { id: listing.userId },
        select: { primaryContact: true },
      })
      const pc  = seller?.primaryContact || 'WHATSAPP'
      // Fall back to the listing's stored value when a field isn't part of this update.
      const wa  = 'whatsappNumber' in parsed.data ? parsed.data.whatsappNumber : listing.whatsappNumber
      const tg  = 'telegram'       in parsed.data ? parsed.data.telegram       : listing.telegram
      const ln  = 'line'           in parsed.data ? parsed.data.line           : listing.line
      if (pc === 'WHATSAPP' && !(wa && wa.trim().length >= 7)) {
        return apiError('Your WhatsApp number is required — it is your primary contact', 422)
      }
      if (pc === 'LINE' && !ln) {
        return apiError('Your Line ID is required — it is your primary contact', 422)
      }
      if (pc === 'TELEGRAM' && !tg) {
        return apiError('Your Telegram username is required — it is your primary contact', 422)
      }
    }

    // Reset to PENDING if owner changes content (needs re-approval)
    const contentChanged = parsed.data.title || parsed.data.description || 'price' in parsed.data

    const { images, videos, ...listingFields } = parsed.data

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...listingFields,
        ...(contentChanged && isOwner && !isAdmin ? { status: 'PENDING' } : {}),
        updatedAt: new Date(),
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((img) => ({
              imageUrl: img.imageUrl,
              publicId: img.publicId,
            })),
          },
        }),
        ...(videos && {
          videos: {
            deleteMany: {},
            create: videos.map((vid) => ({
              videoUrl: vid.videoUrl,
              publicId: vid.publicId,
            })),
          },
        }),
      },
      include: { images: true, videos: true, user: { select: { id: true, name: true } } },
    })

    return apiSuccess(updated)
  } catch (err) {
    console.error('Update listing error:', err)
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(req, { params }) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return apiError('Listing not found', 404)

    const isOwner = listing.userId === currentUser.userId
    const isAdmin = currentUser.role === 'ADMIN'
    if (!isOwner && !isAdmin) return apiError('Forbidden', 403)

    await prisma.listing.delete({ where: { id: params.id } })

    return apiSuccess({ message: 'Listing deleted' })
  } catch (err) {
    console.error('Delete listing error:', err)
    return apiError('Internal server error', 500)
  }
}
