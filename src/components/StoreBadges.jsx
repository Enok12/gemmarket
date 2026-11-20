'use client'

export function GooglePlayBadge({ className = '', playUrl = 'https://play.google.com/store/apps/details?id=com.ggmp.marketplace' }) {
  return (
    <a
      href={playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 px-4 py-2 bg-black hover:bg-neutral-900 text-white rounded-xl border border-white/25 hover:border-white/50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 transition-transform group-hover:scale-105" fill="none">
        <path d="M3.6 1.8c-.4.4-.6 1-.6 1.7v17c0 .7.2 1.3.6 1.7l9.6-9.6L3.6 1.8z" fill="#00C1FF"/>
        <path d="M17.1 11.2l-3.9-3.9L3.6 1.8c.3-.1.6-.2 1-.2.7 0 1.5.4 2.2.8l10.3 5.9v2.9z" fill="#00E676"/>
        <path d="M17.1 12.8L6.8 18.7c-.7.4-1.5.8-2.2.8-.4 0-.7-.1-1-.2l9.6-5.5 3.9-1z" fill="#FF334B"/>
        <path d="M21.2 10.4l-4.1 2.4-3.9-3.9 3.9-3.9 4.1 2.4c1.1.6 1.1 2.4 0 3z" fill="#FFD600"/>
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[10px] tracking-wider uppercase text-gray-300 font-medium">GET IT ON</span>
        <span className="text-sm font-semibold text-white tracking-tight mt-0.5 font-sans">Google Play</span>
      </div>
    </a>
  )
}

