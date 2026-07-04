export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ChevronRight } from 'lucide-react'

async function getCounts(gemType) {
  try {
    const rows = await prisma.listing.groupBy({
      by: ['stoneType'],
      where: { status: 'APPROVED', gemType },
      _count: { stoneType: true },
    })
    return rows.reduce((acc, r) => { acc[r.stoneType] = r._count.stoneType; return acc }, {})
  } catch { return {} }
}

const OPTIONS = [
  {
    value: 'CUT_AND_POLISHED',
    label: 'Cut & Polished',
    desc: 'Finished, faceted gemstones ready to set',
  },
  {
    value: 'ROUGH',
    label: 'Rough Stones',
    desc: 'Uncut, natural rough in its raw form',
  },
]

export default async function GemStoneTypePage({ params }) {
  const gemType = decodeURIComponent(params.gemType)
  const counts  = await getCounts(gemType)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-gem-600 transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/gems" className="hover:text-gem-600 transition-colors">Browse by Gem Type</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{gemType}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{gemType}</h1>
        <p className="text-gray-500 mt-1">Choose the type of stone you're looking for</p>
      </div>

      {/* Two options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((opt) => {
          const count = counts[opt.value] || 0
          return (
            <Link
              key={opt.value}
              href={`/listings?gemType=${encodeURIComponent(gemType)}&stoneType=${opt.value}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 p-6 hover:border-gem-400 hover:shadow-lg transition-all duration-200 bg-white"
            >
              <h2 className="text-lg font-semibold text-gray-900">{opt.label}</h2>
              <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gem-600">
                  {count > 0 ? `${count} listing${count !== 1 ? 's' : ''}` : 'No listings yet'}
                </span>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-gem-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* View all of this gem */}
      <div className="mt-8 text-center">
        <Link
          href={`/listings?gemType=${encodeURIComponent(gemType)}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gem-700 transition-colors"
        >
          Or view all {gemType} listings <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  )
}
