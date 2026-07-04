export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ChevronRight } from 'lucide-react'

const GEMS = [
  'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Alexandrite', 'Chrysoberyl',
  'Spinel', 'Garnet', 'Tourmaline', 'Topaz', 'Zircon', 'Quartz',
  'Aquamarine', 'Morganite', 'Heliodor', 'Moonstone', 'Sunstone', 'Labradorite',
  'Opal', 'Jade', 'Pearl', 'Coral', 'Amber', 'Peridot',
  'Tanzanite', 'Kunzite', 'Iolite', 'Andalusite', 'Kyanite', 'Apatite',
  'Fluorite', 'Sphene', 'Diopside', 'Danburite', 'Benitoite', 'Larimar',
  'Sugilite', 'Rhodonite', 'Rhodochrosite', 'Prehnite', 'Serpentine', 'Zoisite',
  'Scapolite', 'Vesuvianite', 'Hemimorphite', 'Smithsonite', 'Charoite', 'Bloodstone',
  'Amazonite', 'Turquoise', 'Malachite', 'Azurite', "Tiger's Eye", 'Pietersite',
  'Obsidian', 'Agate', 'Onyx', 'Carnelian', 'Jasper', 'Chalcedony',
]

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

      {/* Gem grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {GEMS.map((gem) => {
          const count = counts[gem] || 0
          return (
            <Link
              key={gem}
              href={`/gems/${encodeURIComponent(gem)}`}
              className="group flex flex-col gap-1 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-gem-400 hover:shadow-sm transition-all duration-150"
            >
              <span className="text-sm font-semibold text-gray-900 group-hover:text-gem-700 transition-colors">
                {gem}
              </span>
              <span className="text-xs text-gray-400">
                {count > 0 ? `${count} listing${count !== 1 ? 's' : ''}` : 'No listings yet'}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Browse all CTA */}
      <div className="mt-10 pt-8 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-3">Can't find what you're looking for?</p>
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
