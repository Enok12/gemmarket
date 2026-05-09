import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

const updateSchema = z.object({
  title:          z.string().min(5).optional(),
  price:          z.number().positive().optional(),
  gemType:        z.string().optional(),
  carat:          z.number().positive().optional(),
  color:          z.string().optional(),
  clarity:        z.string().optional(),
  cut:            z.string().optional(),
  origin:         z.string().optional(),
  description:    z.string().min(20).optional(),
  whatsappNumber: z.string().optional(),
  location:       z.string().optional(),
  isCertified:    z.boolean().optional(),
  certificationImage: z.string().optional(),
  images: z.array(                              // ← add this
    z.object({ imageUrl: z.string(), publicId: z.string().optional() })
  ).optional(),
})

export async function GET(req, { params }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        images:   true,
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

    // Reset to PENDING if owner changes content (needs re-approval)
    const contentChanged = parsed.data.title || parsed.data.description || parsed.data.price
    
    const { images, ...listingFields } = parsed.data

const updated = await prisma.listing.update({
  where: { id: params.id },
    data: {
      ...listingFields,
      ...(contentChanged && isOwner && !isAdmin ? { status: 'PENDING' } : {}),
      updatedAt: new Date(),
      ...(images && {
        images: {
          deleteMany: {},                          // remove old images
          create: images.map((img) => ({
            imageUrl: img.imageUrl,
            publicId: img.publicId,
          })),
        },
      }),
    },
    include: { images: true, user: { select: { id: true, name: true } } },
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
