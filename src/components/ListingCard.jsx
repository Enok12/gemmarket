'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Scale, Shield, ShieldOff } from 'lucide-react'
import { formatPrice, getGemColor } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import WhatsAppButton from './WhatsAppButton'



const GEM_EMOJI = {
  Ruby: '🔴', Sapphire: '💎', Emerald: '💚', Spinel: '🔮',
  Topaz: '🔶', Moonstone: '🌙', Amethyst: '🟣', Alexandrite: '🌈',
  Garnet: '🔴', Tourmaline: '🌈', Other: '💎',
}

export default function ListingCard({ listing, showStatus = false }) {
  const { user } = useAuth()   
  const emoji        = GEM_EMOJI[listing.gemType] || '💎'
  const gemColorClass = getGemColor(listing.gemType)
  const mainImage    = listing.images?.[0]?.imageUrl

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gem-300 hover:shadow-md transition-all duration-200">
      {/* Image */}
      <Link href={`/listings/${listing.id}`} className="block relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {mainImage ? (
        <Image
          src={mainImage}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl">{emoji}</div>
      )}

      {/* Sold badge */}
      {listing.availability === 'Sold' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
            SOLD
          </span>
        </div>
      )}

      {showStatus && (
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${
          listing.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
          listing.status === 'PENDING'  ? 'bg-amber-100 text-amber-700' :
                                          'bg-red-100 text-red-700'
        }`}>
          {listing.status}
        </span>
      )}
      </Link>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/listings/${listing.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-gem-700 transition-colors">
              {listing.title}
            </h3>
          </Link>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${gemColorClass}`}>
            {listing.gemType}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Scale size={11} /> {listing.carat} ct</span>
          <span>{listing.color}</span>
          <span>{listing.clarity}</span>
          <span className="flex items-center gap-1"><MapPin size={11} /> {listing.location}</span>
        </div>

        <div className="flex items-center justify-between">
         {user ? (
            <span className="text-base font-bold text-gem-700">{formatPrice(listing.price)}</span>
          ) : (
            <span className="text-base font-bold text-gray-400 tracking-widest">••••••</span>
          )}
          {listing.isCertified ? (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <Shield size={11} /> Certified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ShieldOff size={11} /> Uncertified
            </span>
          )}
        </div>

        <div className="mt-3">
          {(() => {
            const pref = user?.primaryContact || 'WHATSAPP'
            const telegramHandle = listing.telegram || listing.user?.telegram
            const lineId         = listing.line     || listing.user?.line
            if (pref === 'TELEGRAM' && telegramHandle) {
              return (
                <a
                  href={`https://t.me/${telegramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Contact via Telegram
                </a>
              )
            }
            if (pref === 'LINE' && lineId) {
              return (
                <a
                  href={`https://line.me/ti/p/${lineId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.63 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  Contact via Line
                </a>
              )
            }
            return <WhatsAppButton listingId={listing.id} listingTitle={listing.title} compact />
          })()}
        </div>
      </div>
    </div>
  )
}
