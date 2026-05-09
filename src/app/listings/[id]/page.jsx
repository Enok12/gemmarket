export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getGemColor } from '@/lib/utils'
import WhatsAppButton from '@/components/WhatsAppButton'
import {
  MapPin, Scale, Shield, ShieldOff,
  ArrowLeft, Award, Layers, Scissors, Globe, Calendar
} from 'lucide-react'
import PriceDisplay from '@/components/PriceDisplay'


async function getListing(id) {
  return prisma.listing.findUnique({
    where: { id, status: 'APPROVED' },
    include: {
      images:   true,
      user:     { select: { id: true, name: true } },
      tracking: true,
    },
  })
}

export async function generateMetadata({ params }) {
  const listing = await getListing(params.id)
  if (!listing) return { title: 'Listing not found' }
  return {
    title: `${listing.title} – GemMarket`,
    description: listing.description.slice(0, 160),
  }
}

export default async function ListingDetailPage({ params }) {
  const listing = await getListing(params.id)
  if (!listing) notFound()

  const gemColor = getGemColor(listing.gemType)

  const specs = [
    { icon: <Scale size={15} />,    label: 'Carat weight', value: `${listing.carat} ct` },
    { icon: <Layers size={15} />,   label: 'Clarity',      value: listing.clarity },
    { icon: <Scissors size={15} />, label: 'Cut',          value: listing.cut || 'N/A' },
    { icon: <Globe size={15} />,    label: 'Origin',       value: listing.origin },
    { icon: <MapPin size={15} />,   label: 'Location',     value: listing.location },
    {
      icon: <Calendar size={15} />,
      label: 'Listed',
      value: new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/"        className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-gray-700">Listings</Link>
        <span>/</span>
        <Link href={`/listings?gemType=${listing.gemType}`} className="hover:text-gray-700">{listing.gemType}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: images ── */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-3">
            {listing.images[0] ? (
              <Image
                src={listing.images[0].imageUrl}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">💎</div>
            )}
          </div>

          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.images.map((img, i) => (
                <div key={img.id} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={img.imageUrl} alt={`Photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: details ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Badges + title */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${gemColor}`}>
                {listing.gemType}
              </span>
              {listing.isCertified ? (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                  <Shield size={11} /> Certified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <ShieldOff size={11} /> Uncertified
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>
            <p className="text-sm text-gray-500">
              {listing.color} · {listing.carat} carats · from {listing.origin}
            </p>
          </div>

          {/* Price */}
         <div className="bg-gem-50 rounded-xl p-4">
          <PriceDisplay price={listing.price} />
          <p className="text-xs text-gem-500 mt-1">Price is negotiable · Contact seller for details</p>
        </div>

          {/* Specs */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Gem specifications</h3>
            <div className="space-y-2.5">
              {specs.map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">{icon} {label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Certification notice */}
          {listing.isCertified && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <Award size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Certified gemstone</p>
                <p className="text-xs text-green-600 mt-0.5">
                  This seller has provided a certificate of authenticity for this gem.
                </p>
              </div>
            </div>
          )}

          {/* Seller chip */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gem-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-gem-700 font-semibold text-sm">
                {listing.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{listing.user.name}</p>
              <p className="text-xs text-gray-500">Seller · {listing.location}</p>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <WhatsAppButton listingId={listing.id} listingTitle={listing.title} />

          <p className="text-xs text-gray-400 text-center">
            {listing.tracking?.whatsappClicks ?? 0} people have contacted this seller
          </p>

          <Link href="/listings" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={14} /> Back to listings
          </Link>
        </div>
      </div>

      {/* Safety tips */}
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-amber-900 mb-2">Safety tips</h3>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>Always meet in a safe, public location when buying in person</li>
          <li>Request a gemological certificate before any large purchase</li>
          <li>Never send money in advance before inspecting the gemstone</li>
          <li>GemMarket does not handle payments — transact at your own discretion</li>
        </ul>
      </div>
    </div>
  )
}
