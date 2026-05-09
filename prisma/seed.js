const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database…')

  // ── Admin user ──────────────────────────────────────────────
  const adminPwd = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@gemmarket.lk' },
    update: {},
    create: {
      name:     'Admin',
      email:    'admin@gemmarket.lk',
      password: adminPwd,
      role:     'ADMIN',
    },
  })

  // ── Demo seller ─────────────────────────────────────────────
  const sellerPwd = await bcrypt.hash('seller123', 12)
  const seller = await prisma.user.upsert({
    where:  { email: 'seller@gemmarket.lk' },
    update: {},
    create: {
      name:     'Kamal Perera',
      email:    'seller@gemmarket.lk',
      password: sellerPwd,
      role:     'USER',
    },
  })

  // ── Sample listings ─────────────────────────────────────────
  const listings = [
    {
      title:          'Natural Pigeon Blood Ruby – Unheated',
      price:          4200,
      gemType:        'Ruby',
      carat:          3.2,
      color:          'Pigeon Blood Red',
      clarity:        'VS',
      cut:            'Oval',
      origin:         'Myanmar',
      description:    'Exceptional unheated Burmese ruby with strong fluorescence and natural silk inclusions. Highly sought after collector piece. GRS certified with full origin report included.',
      whatsappNumber: '94771234567',
      location:       'Colombo',
      isCertified:    true,
      status:         'APPROVED',
    },
    {
      title:          'Ceylon Blue Sapphire – Royal Blue',
      price:          3800,
      gemType:        'Sapphire',
      carat:          5.6,
      color:          'Royal Blue',
      clarity:        'Eye Clean',
      cut:            'Cushion',
      origin:         'Sri Lanka',
      description:    'Premium Ceylon sapphire with rich royal blue colour. Heat treated for clarity enhancement. Comes with GIA certificate and detailed origin report.',
      whatsappNumber: '94771234567',
      location:       'Ratnapura',
      isCertified:    true,
      status:         'APPROVED',
    },
    {
      title:          'Colombian Emerald – Vivid Green',
      price:          2600,
      gemType:        'Emerald',
      carat:          2.1,
      color:          'Vivid Green',
      clarity:        'Slightly Included',
      cut:            'Emerald Cut',
      origin:         'Colombia',
      description:    'Natural Colombian emerald with exceptional colour saturation. Minor oil treatment as is industry standard. CDT certified with no significant clarity enhancement.',
      whatsappNumber: '94771234567',
      location:       'Colombo',
      isCertified:    true,
      status:         'APPROVED',
    },
    {
      title:          'Pink Spinel – Hot Pink',
      price:          1400,
      gemType:        'Spinel',
      carat:          1.9,
      color:          'Hot Pink',
      clarity:        'Eye Clean',
      cut:            'Round Brilliant',
      origin:         'Myanmar',
      description:    'Gorgeous hot pink spinel with zero treatments. Highly refractive stone with excellent brilliance and no window. One of the most coveted gem colours in the market.',
      whatsappNumber: '94771234567',
      location:       'Ratnapura',
      isCertified:    true,
      status:         'APPROVED',
    },
    {
      title:          'Imperial Topaz – Golden Orange',
      price:          980,
      gemType:        'Topaz',
      carat:          4.8,
      color:          'Golden Orange',
      clarity:        'VVS',
      cut:            'Pear',
      origin:         'Brazil',
      description:    'Beautiful imperial topaz with warm golden-orange hue. Natural colour, no treatments whatsoever. Excellent eye-clean clarity with strong brilliance.',
      whatsappNumber: '94771234567',
      location:       'Galle',
      isCertified:    false,
      status:         'APPROVED',
    },
    {
      title:          'Rainbow Moonstone – Blue Flash',
      price:          320,
      gemType:        'Moonstone',
      carat:          6.0,
      color:          'Colorless with Blue Adularescence',
      clarity:        'Eye Clean',
      cut:            'Cabochon',
      origin:         'Sri Lanka',
      description:    'Classic Ceylon moonstone with strong blue flash adularescence. Perfect cabochon cut to maximise the optical effect. No treatments.',
      whatsappNumber: '94771234567',
      location:       'Matara',
      isCertified:    true,
      status:         'APPROVED',
    },
    {
      title:          'Purple Amethyst – Deep Violet',
      price:          180,
      gemType:        'Amethyst',
      carat:          8.4,
      color:          'Deep Purple',
      clarity:        'Eye Clean',
      cut:            'Cushion',
      origin:         'Brazil',
      description:    'Rich deep purple amethyst with excellent cutting. Natural colour with no heat treatment. Great value collector piece.',
      whatsappNumber: '94771234567',
      location:       'Colombo',
      isCertified:    false,
      status:         'PENDING',
    },
    {
      title:          'Alexandrite – Colour Change',
      price:          5500,
      gemType:        'Alexandrite',
      carat:          1.4,
      color:          'Green to Red',
      clarity:        'VS',
      cut:            'Oval',
      origin:         'Sri Lanka',
      description:    'Rare natural alexandrite showing strong colour change from green in daylight to raspberry red under incandescent light. GIA certified.',
      whatsappNumber: '94771234567',
      location:       'Kandy',
      isCertified:    true,
      status:         'APPROVED',
    },
  ]

  for (const data of listings) {
    const existing = await prisma.listing.findFirst({
      where: { title: data.title, userId: seller.id },
    })
    if (!existing) {
      const listing = await prisma.listing.create({
        data: { ...data, userId: seller.id },
      })
      await prisma.tracking.create({
        data: { listingId: listing.id, whatsappClicks: Math.floor(Math.random() * 25) },
      })
    }
  }

  console.log('✅ Seed complete!')
  console.log(`   Admin  → admin@gemmarket.lk  / admin123`)
  console.log(`   Seller → seller@gemmarket.lk / seller123`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
