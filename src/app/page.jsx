export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import ListingCard from '@/components/ListingCard'
import { Search, Shield, MessageCircle, Gem, ArrowRight, Star } from 'lucide-react'
import { GEM_TYPES } from '@/lib/utils'

const GEM_COLORS = {
  Ruby: 'bg-red-50 text-red-700 hover:bg-red-100',
  Sapphire: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  Emerald: 'bg-green-50 text-green-700 hover:bg-green-100',
  Spinel: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
  Topaz: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  Moonstone: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
  Amethyst: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  Alexandrite: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
  Garnet: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  Tourmaline: 'bg-lime-50 text-lime-700 hover:bg-lime-100',
  Other: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
}

const CATEGORY_IMAGES = {
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
  Aquamarine:  'https://res.cloudinary.com/dapowzg6d/image/upload/v1783789666/images_wjczis.jpg',
}

// Fallback gradient for categories that don't have a photo yet
const CATEGORY_GRADIENTS = {}

async function getFeaturedListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        images:   { take: 1 },
        user:     { select: { id: true, name: true } },
        tracking: true,
      },
    })
  } catch { return [] }
}

async function getStats() {
  try {
    const [listingCount, userCount] = await Promise.all([
      prisma.listing.count({ where: { status: 'APPROVED' } }),
      prisma.user.count(),
    ])
    return { listingCount, userCount }
  } catch { return { listingCount: 0, userCount: 0 } }
}

async function getCategoryCounts() {
  try {
    const counts = await prisma.listing.groupBy({
      by: ['gemType'],
      where: { status: 'APPROVED' },
      _count: { gemType: true },
    })
    return counts.reduce((acc, item) => {
      acc[item.gemType] = item._count.gemType
      return acc
    }, {})
  } catch { return {} }
}

export default async function HomePage() {
  const [listings, stats, categoryCounts] = await Promise.all([
    getFeaturedListings(),
    getStats(),
    getCategoryCounts()
  ])

  const CATEGORIES = Object.keys(CATEGORY_IMAGES).map((name) => ({
    name,
    image: CATEGORY_IMAGES[name],
    gradient: CATEGORY_GRADIENTS[name],
    count: categoryCounts[name] || 0,
  }))

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-24">
          {/* <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gem-50 text-gem-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Star size={13} /> World's #1 gemstone marketplace
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
              Find rare gemstones,<br />
              <span className="text-gem-600">direct from the source</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              We connect you, to the global market place and make your future success. GGMP Global Gem Market Place
            </p>

            <form action="/listings" method="GET" className="flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="search" type="text"
                  placeholder="Search rubies, sapphires, emeralds…"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gem-300 bg-gray-50"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-gem-600 text-white font-medium text-sm rounded-xl hover:bg-gem-700 transition-colors">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-6 mt-10">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.listingCount}+</div>
                <div className="text-sm text-gray-500">Active listings</div>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.userCount}+</div>
                <div className="text-sm text-gray-500">Verified sellers</div>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900">24 hr</div>
                <div className="text-sm text-gray-500">Approval time</div>
              </div>
            </div>
          </div> */}

          <div className="flex items-center justify-between gap-8">
          {/* Left — text */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-1"
              style={{ backgroundColor: '#4169E115', color: '#6235eb' }}>
              <Star size={13} /> World's 1# Online Gemstone Marketplace
            </div>
            {/* <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
              Find rare gemstones,<br />
              <span className="text-gem-600">Direct from the source</span>
            </h1> */}

              {/* CTA banner */}
              <section className="max-w-7xl mx-auto px-2 sm:px-1 lg:px-0 py-4">
                <div className="bg-gem-600 rounded-2xl p-5 md:p-12 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Ready to buy or sell your gemstones?</h2>
                  <p className="text-gem-200 mb-2">Join hundreds of sellers reaching verified buyers every day.</p>
                  <Link href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gem-700 font-semibold text-lg rounded-xl hover:bg-gem-50 transition-colors">
                    Post your GEM — it's free 
                  </Link>
                </div>
              </section>
              
            <p className="text-md text-gray-600 mb-2 max-w-2xl">
              We connect you, to the global market place and make your future success. GGMP Global Gem Market Place            </p>
            {/* <p className="text-base font-semibold text-gem-700 mb-8">
              GGMP — Global Gemstone Market Place
            </p> */}

          <form action="/listings" method="GET" className="hidden md:flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="search" type="text"
                  placeholder="Search rubies, sapphires, emeralds…"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gem-300 bg-gray-50"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-gem-600 text-white font-medium text-sm rounded-xl hover:bg-gem-700 transition-colors">
                Search
              </button>
            </form>

      
          </div>

          {/* Right — GGMP logo, hidden on mobile */}
          <div className="hidden lg:flex shrink-0 items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dapowzg6d/image/upload/v1778814576/cc0f0a63-9754-45ca-b547-3cb0f0a98e02_x6mckj.jpg"
              alt="GGMP Global Gem Market Place"
              width={400}
              height={400}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
        </div>
      </section>

      {/* Gem type pills */}
      {/* <section className="bg-gray-50 border-b border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <Link href="/listings" className="px-4 py-2 bg-gem-600 text-white text-sm font-medium rounded-full hover:bg-gem-700 transition-colors">
              All gems
            </Link>
            {GEM_TYPES.slice(0, -1).map((gem) => (
              <Link key={gem} href={`/listings?gemType=${gem}`}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${GEM_COLORS[gem]}`}>
                {gem}
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Categories grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Shop by gemstone</h2>
          <Link href="/gems" className="flex items-center gap-1 text-sm text-gem-600 hover:text-gem-800 font-medium">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/gems/${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Image (or gradient fallback if no photo yet) */}
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient || 'from-gem-300 to-gem-500'} group-hover:scale-105 transition-transform duration-300`} />
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-3">
              <p className="text-white font-semibold text-xs sm:text-sm">{cat.name}</p>
              {cat.count > 0 && (
                <p className="text-white/70 text-xs mt-0.5 hidden sm:block">{cat.count} listings</p>
              )}
            </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Latest listings</h2>
          <Link href="/listings" className="flex items-center gap-1 text-sm text-gem-600 hover:text-gem-800 font-medium">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Gem size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No listings yet. Be the first to post a gem!</p>
            <Link href="/create" className="mt-4 inline-block btn-primary">Post a listing</Link>
          </div>
        )}

        {listings.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/listings" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Browse all listings <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">How GemMarket works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Gem size={22} />,           step: '01', title: 'Create an account',    desc: 'Register free in under a minute. No subscription needed.' },
              { icon: <Search size={22} />,        step: '02', title: 'Post your listing',    desc: 'Upload photos, set gem specs, price, and your WhatsApp number/ Telegram / Line.' },
              { icon: <Shield size={22} />,        step: '03', title: 'Get approved',         desc: 'Our team reviews listings instantly for quality.' },
              { icon: <MessageCircle size={22} />, step: '04', title: 'Chat on WhatsApp / Telegram / Line',     desc: 'Buyers reach you directly — no middlemen, no commissions.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gem-50 text-gem-600 rounded-xl flex items-center justify-center mb-4">{icon}</div>
                <span className="text-xs font-semibold text-gem-500 mb-1">{step}</span>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
