'use client'

import { useCallback, useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

export default function ImageUpload({ images, onChange, maxImages = 5 }) {
  const { token }    = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)

  async function uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res  = await fetch('/api/upload', {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      })
      const data = await res.json()
      return data.success ? data.data : null
    } catch {
      return null
    }
  }

  const handleFiles = useCallback(async (files) => {
    const remaining = maxImages - images.length
    const toUpload  = Array.from(files).slice(0, remaining)
    if (!toUpload.length) return

    setUploading(true)
    const results = await Promise.all(toUpload.map(uploadFile))
    const valid   = results.filter(Boolean)
    onChange([...images, ...valid])
    setUploading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, maxImages, onChange])

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {images.length < maxImages && (
        <label
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            dragOver
              ? 'border-gem-400 bg-gem-50'
              : 'border-gray-300 bg-gray-50 hover:border-gem-400 hover:bg-gem-50'
          }`}
        >
          <input type="file" className="hidden" accept="image/*" multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 size={24} className="text-gem-500 animate-spin mb-2" />
              <span className="text-sm text-gray-500">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Drop images or click to upload</span>
              <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max 10 MB · {images.length}/{maxImages}</span>
            </>
          )}
        </label>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image src={img.url} alt={`Upload ${index + 1}`} fill className="object-cover" />
              <button type="button" onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
