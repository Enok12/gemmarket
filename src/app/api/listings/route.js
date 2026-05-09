export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

const createSchema = z.object({
  title:          z.string().min(5),
  price:          z.number().positive(),
  gemType:        z.string().min(1),
  carat:          z.number().positive(),
  color:          z.string().min(1),
  clarity:        z.string().min(1),
  cut:            z.string().optional(),
  origin:         z.string().min(1),
  description:    z.string().min(20),
  whatsappNumber: z.string().min(7),
  location:       z.string().min(1),
  isCertified:    z.boolean().default(false),
  certificationImage: z.string().optional(),
  images: z.array(
    z.object({ imageUrl: z.string(), publicId: z.string().optional() })
  ).optional(),
})

// GET /api/listings
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const search    = searchParams.get('search') || ''
    const gemType   = searchParams.get('gemType') || ''
    const location  = searchParams.get('location') || ''
    const certified = searchParams.get('certified')
    const minPrice  = searchParams.get('minPrice')
    const maxPrice  = searchParams.get('maxPrice')
    const page      = parseInt(searchParams.get('page') || '1')
    const limit     = parseInt(searchParams.get('limit') || '12')
    const skip      = (page - 1) * limit

    const where = {
      status: 'APPROVED',
      ...(search && {
        OR: [
          { title:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { gemType:     { contains: search, mode: 'insensitive' } },
          { origin:      { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(gemType   && { gemType }),
      ...(location  && { location }),
      ...(certified === 'true' && { isCertified: true }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
          ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
        },
      }),
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images:   { take: 1 },
          user:     { select: { id: true, name: true } },
          tracking: { select: { whatsappClicks: true } },
        },
      }),
      prisma.listing.count({ where }),
    ])

    return apiSuccess({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('Get listings error:', err)
    return apiError('Internal server error', 500)
  }
}

// POST /api/listings
export async function POST(req) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const { images, ...listingData } = parsed.data

    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        userId: currentUser.userId,
        ...(images?.length && {
          images: { create: images.map((img) => ({ imageUrl: img.imageUrl, publicId: img.publicId })) },
        }),
        tracking: { create: {} },
      },
      include: {
        images:   true,
        tracking: true,
        user:     { select: { id: true, name: true, email: true } },
      },
    })

    return apiSuccess(listing, 201)
  } catch (err) {
    console.error('Create listing error:', err)
    return apiError('Internal server error', 500)
  }
}
