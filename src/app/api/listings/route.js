export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { createListingLimiter, checkRateLimit } from '@/lib/ratelimit'
import { generateItemCode } from '@/lib/itemCode'


const createSchema = z.object({
  title:          z.string().min(5),
  price:          z.number().positive().nullable().optional(),
  gemType:        z.string().min(1),
  stoneType:      z.enum(['ROUGH', 'CUT_AND_POLISHED']).default('CUT_AND_POLISHED'),
  carat:          z.number().positive(),
  color:          z.string().min(1),
  clarity:        z.string().optional(),
  cut:            z.string().optional(),
  origin:         z.string().optional(),
  description:    z.string().min(20),
  whatsappNumber: z.string().min(7),
  telegram: z.string().nullable().optional().transform(v => v || null),
  line:     z.string().nullable().optional().transform(v => v || null),
  location:       z.string().optional(),
  isCertified:    z.boolean().default(false),
  certificationImage: z.string().optional(),
  availability:   z.enum(['Available', 'Sold']).default('Available'),
  images: z.array(
    z.object({ imageUrl: z.string(), publicId: z.string().optional() })
  ).optional(),
  videos: z.array(                                                        // ← add this
    z.object({ videoUrl: z.string(), publicId: z.string().optional() })
  ).optional(),
})

// GET /api/listings
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const search    = searchParams.get('search') || ''
    const gemType   = searchParams.get('gemType') || ''
    const stoneType = searchParams.get('stoneType') || ''
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
      ...(['ROUGH', 'CUT_AND_POLISHED'].includes(stoneType) && { stoneType }),
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
          videos:   true,
          user:     { select: { id: true, name: true, telegram: true, line: true } },
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

  // Rate limit check
    const { success } = await checkRateLimit(createListingLimiter, req)
    if (!success) {
      return apiError('Too many listing submissions. Please try again in 1 hour.', 429)
    }
    
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return apiError('Unauthorized', 401)

    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const { images, videos, ...listingData } = parsed.data

    // Assign the next GGMP item code. Retry if two listings race for the
    // same code (unique constraint violation, Prisma error P2002).
    let listing
    for (let attempt = 0; ; attempt++) {
      try {
        listing = await prisma.listing.create({
          data: {
            ...listingData,
            itemCode: await generateItemCode(),
            userId: currentUser.userId,
            ...(images?.length && {
              images: { create: images.map((img) => ({ imageUrl: img.imageUrl, publicId: img.publicId })) },
            }),
            ...(videos?.length && {
              videos: { create: videos.map((vid) => ({ videoUrl: vid.videoUrl, publicId: vid.publicId })) },
            }),
            tracking: { create: {} },
          },
          include: {
            images:   true,
            videos:   true,
            tracking: true,
            user:     { select: { id: true, name: true, email: true } },
          },
        })
        break
      } catch (err) {
        const isCodeCollision =
          err.code === 'P2002' && err.meta?.target?.includes?.('itemCode')
        if (!isCodeCollision || attempt >= 4) throw err
      }
    }

    return apiSuccess(listing, 201)
  } catch (err) {
    console.error('Create listing error:', err)
    return apiError('Internal server error', 500)
  }
}
