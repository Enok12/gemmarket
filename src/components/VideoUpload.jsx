'use client'

import { useState } from 'react'
import { Video, X, Loader2, Play } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { uploadToCloudinary } from '@/lib/uploadToCloudinary'

export default function VideoUpload({ video, onChange }) {
  const { token }    = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [dragOver, setDragOver]   = useState(false)

  async function handleFile(file) {
    if (!file) return

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Video too large. Max 50 MB.')
      return
    }

    const allowed = ['video/mp4', 'video/quicktime', 'video/avi', 'video/webm']
    if (!allowed.includes(file.type)) {
      alert('Invalid video type. Use MP4, MOV, AVI or WebM.')
      return
    }

    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadToCloudinary(file, { type: 'video', token, onProgress: setProgress })
      if (result) onChange(result)
    } catch (e) {
      alert(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function removeVideo() {
    onChange(null)
  }

  return (
    <div className="space-y-3">
      {!video ? (
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
          <input
            type="file"
            className="hidden"
            accept="video/mp4,video/quicktime,video/avi,video/webm"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={uploading}
          />
          {uploading ? (
            <div className="w-full px-6 flex flex-col items-center">
              <Loader2 size={24} className="text-gem-500 animate-spin mb-2" />
              <span className="text-sm text-gray-600 font-medium">Uploading video… {progress}%</span>
              <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gem-500 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <Video size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Drop video or click to upload</span>
              <span className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM · Max 50 MB · 1 video only</span>
            </>
          )}
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-black group">
          <video
            src={video.url}
            controls
            className="w-full max-h-64 object-contain"
          />
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 border-t-0 rounded-b-xl">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Play size={11} /> Video uploaded successfully
            </p>
          </div>
        </div>
      )}
    </div>
  )
}