'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Listing photo gallery: a large main image plus clickable thumbnails.
 * Client component because the selected image is interactive state.
 */
export default function ImageGallery({ images = [], title }) {
  const [active, setActive] = useState(0)
  const count = images.length
  const current = images[active]

  const go = (delta) => setActive((i) => (i + delta + count) % count)

  return (
    <div>
      <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-3">
        {current ? (
          <Image
            key={current.id ?? active}
            src={current.imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority={active === 0}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">💎</div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-2 right-2 text-xs bg-black/55 text-white px-2 py-0.5 rounded-full">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-gem-600' : 'border-gray-200 hover:border-gem-300'
              }`}
            >
              <Image src={img.imageUrl} alt={`Photo ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
