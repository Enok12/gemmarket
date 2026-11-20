'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, X } from 'lucide-react'
import { GooglePlayBadge } from './StoreBadges'

export default function AppTopBanner() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (sessionStorage.getItem('ggmp_top_banner_dismissed') === 'true') {
        setDismissed(true)
      }
    } catch {
      // ignore
    }
  }, [])

  if (!mounted || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem('ggmp_top_banner_dismissed', 'true')
    } catch {
      // ignore
    }
  }

  return (
    // Hidden on mobile (hidden md:block)
    <div className="hidden md:block relative z-40 bg-gradient-to-r from-[#170b36] via-[#2f136a] to-[#120729] text-white border-b border-gem-500/30 shadow-md">
      {/* Decorative top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gem-400 to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Highlight Pill & Message */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-gem-500 to-indigo-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(113,85,245,0.4)] shrink-0">
            <Image
              src="/ggmp-app-icon.webp"
              alt="GGMP Icon"
              width={18}
              height={18}
              className="rounded-full object-cover shrink-0"
            />
            <span>GGMP Mobile App</span>
          </div>

          <p className="text-xs lg:text-sm text-gray-200 truncate">
            Experience real-time inquiries, instant gemstone alerts &amp; faster browsing on your phone.
          </p>
        </div>

        {/* Right: Google Play Badge & Dismiss button */}
        <div className="flex items-center gap-3 shrink-0">
          <GooglePlayBadge className="!py-1.5 !px-3 !rounded-lg scale-90 origin-right" />

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
