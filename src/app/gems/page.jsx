export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ChevronRight } from 'lucide-react'

const GEM_CATEGORIES = [
  {
    title: 'Traditional Precious Gemstones',
    description: 'The four classic precious stones prized throughout history',
    gems: ['Diamond', 'Ruby', 'Sapphire', 'Emerald'],
  },
  {
    title: 'Popular Semi-Precious Gemstones',
    description: 'Vibrant stones beloved for their beauty and variety',
    gems: ['Amethyst', 'Topaz', 'Garnet', 'Aquamarine', 'Tourmaline', 'Peridot', 'Citrine', 'Spinel', 'Zircon', 'Tanzanite', 'Moonstone', 'Sunstone', 'Alexandrite', 'Morganite', 'Kunzite'],
  },
  {
    title: 'Quartz Family',
    description: 'One of the most abundant mineral families with stunning varieties',
    gems: ['Amethyst', 'Citrine', 'Rose Quartz', 'Smoky Quartz', 'Rock Crystal', 'Ametrine'],
  },
  {
    title: 'Beryl Family',
    description: 'Precious beryls ranging from vivid green to soft pink',
    gems: ['Emerald', 'Aquamarine', 'Morganite', 'Heliodor', 'Goshenite'],
  },
  {
    title: 'Corundum Family',
    description: 'The family of rubies and sapphires in every colour of the rainbow',
    gems: ['Ruby', 'Sapphire', 'Blue Sapphire', 'Yellow Sapphire', 'Pink Sapphire', 'White Sapphire', 'Padparadscha Sapphire', 'Green Sapphire', 'Purple Sapphire'],
  },
]

const GEM_IMAGES = {
  Ruby:        'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353585/Ruby_x6yv0k.webp',
  Sapphire:    'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353586/Sapphire_ntlrtr.avif',
  Emerald:     'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353585/Emerald_frqzlk.avif',
  Zircon:      'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353586/Zircon_vqvzrz.avif',
  Spinel:      'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353585/natural-red-spinel-white-background-included-clipping-path-natural-red-spinel-white-background-included-clipping-path-168379268_zoe3yu.webp',
  Topaz:       'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353587/Topaz_s06o1b.jpg',
  Moonstone:   'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353586/Moonstone_jo1crw.jpg',
  Amethyst:    'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353585/Amethyst_po7l5m.jpg',
  Alexandrite: 'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353585/Alaxandrite_gltgmh.jpg',
  Garnet:      'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353586/Garnet_xyqz0i.jpg',
  Tourmaline:  'https://res.cloudinary.com/dapowzg6d/image/upload/v1779353587/Tourmaline_bcyyiy.webp',
}

const GEM_GRADIENTS = {
  Diamond:                'from-slate-100 via-blue-50 to-white',
  Aquamarine:             'from-cyan-300 to-blue-400',
  Peridot:                'from-lime-400 to-green-500',
  Citrine:                'from-yellow-300 to-amber-500',
  Tanzanite:              'from-violet-500 to-indigo-800',
  Sunstone:               'from-orange-300 to-amber-500',
  Morganite:              'from-pink-200 to-rose-300',
  Kunzite:                'from-pink-300 to-violet-300',
  'Rose Quartz':          'from-pink-200 to-rose-300',
  'Smoky Quartz':         'from-stone-400 to-gray-600',
  'Rock Crystal':         'from-slate-100 to-blue-100',
  Ametrine:               'from-purple-400 to-yellow-400',
  Heliodor:               'from-yellow-300 to-green-300',
  Goshenite:              'from-slate-100 to-blue-50',
  'Blue Sapphire':        'from-blue-600 to-indigo-800',
  'Yellow Sapphire':      'from-yellow-300 to-amber-500',
  'Pink Sapphire':        'from-pink-300 to-rose-500',
  'White Sapphire':       'from-slate-100 to-blue-100',
  'Padparadscha Sapphire':'from-orange-200 to-pink-400',
  'Green Sapphire':       'from-green-500 to-teal-600',
  'Purple Sapphire':      'from-purple-400 to-violet-700',
}

async function getCounts() {
  try {
    const rows = await prisma.listing.groupBy({
      by: ['gemType'],
      where: { status: 'APPROVED' },
      _count: { gemType: true },
    })
    return rows.reduce((acc, r) => { acc[r.gemType] = r._count.gemType; return acc }, {})
  } catch { return {} }
}

function GemCard({ name, count, image, gradient }) {
  return (
    <Link
      href={`/listings?gemType=${encodeURIComponent(name)}`}
      className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-lg transition-all duration-200"
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient || 'from-gem-200 to-gem-500'}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
        <p className="text-white font-semibold text-xs sm:text-sm leading-tight">{name}</p>
        <p className="text-white/70 text-xs mt-0.5">
          {count > 0 ? `${count} listing${count !== 1 ? 's' : ''}` : 'Coming soon'}
        </p>
      </div>
    </Link>
  )
}

export default async function GemsPage() {
  const counts = await getCounts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gem-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Browse by Gem Type</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Browse by Gem Type</h1>
        <p className="text-gray-500 mt-1">Select a gemstone to see all available listings</p>
      </div>

      {/* Category sections */}
      <div className="space-y-10">
        {GEM_CATEGORIES.map((category) => (
          <section key={category.title}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
              {category.gems.map((gem) => (
                <GemCard
                  key={`${category.title}-${gem}`}
                  name={gem}
                  count={counts[gem] || 0}
                  image={GEM_IMAGES[gem]}
                  gradient={GEM_GRADIENTS[gem]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Browse all CTA */}
      <div className="mt-12 text-center border-t border-gray-100 pt-8">
        <p className="text-gray-500 text-sm mb-3">Can't find what you're looking for?</p>
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gem-600 text-white font-medium rounded-xl hover:bg-gem-700 transition-colors text-sm"
        >
          Browse all listings
        </Link>
      </div>
    </div>
  )
}
