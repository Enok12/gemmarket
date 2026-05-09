'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WhatsAppButton({ listingId, listingTitle, compact = false, className }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res  = await fetch('/api/track/whatsapp-click', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ listingId }),
      })
      const data = await res.json()
      if (data.success && data.data.whatsappUrl) {
        window.open(data.data.whatsappUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error('WhatsApp track error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center justify-center gap-2 font-medium rounded-lg transition-colors',
        'bg-[#25D366] hover:bg-[#20bd5a] text-white',
        compact ? 'w-full py-2 text-sm' : 'px-6 py-3 text-base',
        loading && 'opacity-75 cursor-not-allowed',
        className
      )}
    >
      <MessageCircle size={compact ? 15 : 18} />
      {loading ? 'Opening…' : compact ? 'Chat on WhatsApp' : 'Contact Seller on WhatsApp'}
    </button>
  )
}
