'use client'

import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Share2, X, Copy, Check, Download, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShareButton({ url, title }) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef(null)

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  function downloadQR() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40)}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Share this listing"
        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
      >
        <Share2 size={16} /> Share
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">Share listing</h3>
            <p className="text-sm text-gray-500 mb-5">Scan the QR code to open this listing</p>

            {/* QR */}
            <div ref={qrRef} className="flex justify-center mb-5">
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <QRCodeCanvas value={url} size={200} level="M" includeMargin={false} />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-sm rounded-lg transition-colors"
              >
                <MessageCircle size={16} /> Share on WhatsApp
              </a>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} /> Save QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
