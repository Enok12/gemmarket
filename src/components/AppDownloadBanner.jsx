'use client'

import Image from 'next/image'
import { Sparkles, ShieldCheck, Zap, Bell, Star } from 'lucide-react'
import { GooglePlayBadge } from './StoreBadges'

export default function AppDownloadBanner() {
  return (
    // Hidden on mobile version (hidden md:block)
    <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0d44] via-[#2d1264] to-[#0f0524] text-white p-8 lg:p-12 border border-gem-500/30 shadow-2xl">
        {/* Ambient lighting glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gem-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Shimmer top border line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gem-400 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Text & Store Badges */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gem-500/20 border border-gem-400/30 text-gem-200 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-300" />
              <span>Official GGMP Mobile Application</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              Download the App
            </h2>

            <p className="text-base text-gray-300 mb-6 leading-relaxed">
              Trade rare gemstones directly from your pocket. Get instant WhatsApp &amp; Telegram inquiries, fast push notifications, and verified global gemstone marketplace access anytime.
            </p>

            {/* Google Play Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
              <GooglePlayBadge />
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-gem-400 shrink-0" />
                <span>Instant Inquiry Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-amber-400 shrink-0" />
                <span>Lightning Fast Browsing</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                <span>Verified Gem Traders</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual App Mockup Card */}
          <div className="shrink-0 relative">
            <div className="w-72 lg:w-80 rounded-2xl bg-white/5 border border-white/15 p-5 backdrop-blur-md shadow-2xl relative">
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-amber-400/30 flex items-center justify-center shadow-xl overflow-hidden shrink-0 p-0.5">
                  <Image
                    src="/ggmp-app-icon.webp"
                    alt="GGMP App"
                    width={56}
                    height={56}
                    className="object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">GGMP Gemstone App</h4>
                  <p className="text-xs text-gray-400">Global Gem Marketplace</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] text-gray-300 ml-1 font-medium">4.9</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-gray-300">Google Play Availability</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" /> Live Now
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-gray-300">Listing Commission</span>
                  <span className="text-white font-semibold">0% Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
