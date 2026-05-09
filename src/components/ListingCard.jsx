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
  const { user } = useAuth()   // ← add this line
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
          <WhatsAppButton listingId={listing.id} listingTitle={listing.title} compact />
        </div>
      </div>
    </div>
  )
}
