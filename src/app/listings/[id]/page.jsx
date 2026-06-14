export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getGemColor } from '@/lib/utils'
import { verifyToken } from '@/lib/auth'
import WhatsAppButton from '@/components/WhatsAppButton'
import {
  MapPin, Scale, Shield, ShieldOff,
  ArrowLeft, Award, Layers, Scissors, Globe, Calendar, CheckCircle, XCircle
} from 'lucide-react'
import PriceDisplay from '@/components/PriceDisplay'


async function getListing(id) {
  return prisma.listing.findUnique({
    where: { id, status: 'APPROVED' },
    include: {
      images:   true,
      videos:   true,
      user: { select: { id: true, name: true, whatsapp: true, telegram: true, line: true } },
      tracking: true,
    },
  })
}

export async function generateMetadata({ params }) {
  const listing = await getListing(params.id)
  if (!listing) return { title: 'Listing not found' }
  return {
    title: `${listing.title} – GGMP`,
    description: listing.description.slice(0, 160),
  }
}

async function getViewerPreference() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return 'WHATSAPP'
    const { userId } = verifyToken(token)
    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { primaryContact: true },
    })
    return viewer?.primaryContact ?? 'WHATSAPP'
  } catch {
    return 'WHATSAPP'
  }
}

export default async function ListingDetailPage({ params }) {
  const [listing, viewerPreference] = await Promise.all([
    getListing(params.id),
    getViewerPreference(),
  ])
  if (!listing) notFound()

  const gemColor = getGemColor(listing.gemType)

  // Build ordered contact list based on viewer's preference
  const available = {
    WHATSAPP: listing.whatsappNumber,
    TELEGRAM: listing.telegram || listing.user.telegram || null,
    LINE:     listing.line     || listing.user.line     || null,
  }
  const ORDER = ['WHATSAPP', 'TELEGRAM', 'LINE']
  const sorted = [viewerPreference, ...ORDER.filter(k => k !== viewerPreference)]
    .filter(k => available[k])
  const primaryContact  = sorted[0]  ?? 'WHATSAPP'
  const secondaryContacts = sorted.slice(1)

  const specs = [
    { icon: <Scale size={15} />,    label: 'Carat weight', value: `${listing.carat} ct` },
    ...(listing.clarity  ? [{ icon: <Layers size={15} />,   label: 'Clarity',  value: listing.clarity }]  : []),
    ...(listing.cut      ? [{ icon: <Scissors size={15} />, label: 'Cut',      value: listing.cut }]      : []),
    ...(listing.origin   ? [{ icon: <Globe size={15} />,    label: 'Origin',   value: listing.origin }]   : []),
    ...(listing.location ? [{ icon: <MapPin size={15} />,   label: 'Location', value: listing.location }] : []),
    {
      icon: <Calendar size={15} />,
      label: 'Listed',
      value: new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    {
      icon: listing.availability === 'Available'
        ? <CheckCircle size={15} className="text-green-600" />
        : <XCircle size={15} className="text-red-500" />,
      label: 'Availability',
      value: listing.availability === 'Available' ? 'Available' : 'Sold',
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

          {/* Video player */}
          {listing.videos?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Gem video
              </h3>
              <div className="rounded-xl overflow-hidden bg-black">
                <video
                  src={listing.videos[0].videoUrl}
                  controls
                  className="w-full max-h-72 object-contain"
                  poster={listing.images[0]?.imageUrl}
                />
              </div>
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
              {listing.color} · {listing.carat} carats
              {listing.origin ? ` · from ${listing.origin}` : ''}
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
                  <span className={`font-medium ${
                    label === 'Availability'
                    ? value === 'Available'
                        ? 'text-green-600'
                        : 'text-red-500'
                      : 'text-gray-900'
                  }`}>
                    {value}
                  </span>
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

          {/* Primary contact CTA */}
          {primaryContact === 'WHATSAPP' && (
            <WhatsAppButton listingId={listing.id} listingTitle={listing.title} />
          )}
          {primaryContact === 'TELEGRAM' && (
            <a
              href={`https://t.me/${available.TELEGRAM.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Contact via Telegram
            </a>
          )}
          {primaryContact === 'LINE' && (
            <a
              href={`https://line.me/ti/p/${available.LINE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold rounded-xl transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.63 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              Contact via Line
            </a>
          )}

          {/* Secondary contacts */}
          {secondaryContacts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Also contact via:</p>
              <div className="flex flex-wrap gap-2">
                {secondaryContacts.includes('WHATSAPP') && (
                  <a
                    href={`https://wa.me/${listing.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {secondaryContacts.includes('TELEGRAM') && (
                  <a
                    href={`https://t.me/${available.TELEGRAM.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </a>
                )}
                {secondaryContacts.includes('LINE') && (
                  <a
                    href={`https://line.me/ti/p/${available.LINE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 border border-green-300 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.63 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    Line
                  </a>
                )}
              </div>
            </div>
          )}

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
          <li>GGMP does not handle payments — transact at your own discretion</li>
        </ul>
      </div>
    </div>
  )
}
