'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'
import { GEM_TYPES, LOCATIONS, CLARITY_OPTIONS } from '@/lib/utils'
import { Loader2, Info } from 'lucide-react'

const schema = z.object({
  title:          z.string().min(5, 'Title must be at least 5 characters'),
  price:          z.number({ invalid_type_error: 'Enter a valid price' }).positive('Price must be positive'),
  gemType:        z.string().min(1, 'Select a gem type'),
  carat:          z.number({ invalid_type_error: 'Enter a valid carat weight' }).positive('Must be positive'),
  color:          z.string().min(1, 'Color is required'),
  clarity:        z.string().min(1, 'Select a clarity grade'),
  cut:            z.string().optional(),
  origin:         z.string().min(1, 'Origin is required'),
  description:    z.string().min(20, 'Description must be at least 20 characters'),
  whatsappNumber: z.string().min(7, 'Enter your WhatsApp number'),
  location:       z.string().min(1, 'Select a location'),
  isCertified:    z.boolean().default(false),
})

export default function CreateListingPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages]   = useState([])

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isCertified: false },
  })

  useEffect(() => {
    if (!user) router.push('/login?redirect=/create')
  }, [user, router])

  async function onSubmit(data) {
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/listings', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          images: images.map((img) => ({ imageUrl: img.url, publicId: img.publicId })),
        }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Listing submitted! It will go live after review.')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Failed to create listing')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const descLength = watch('description')?.length ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a gemstone listing</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in your gem details. Listings are reviewed within 24 hours.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Your listing will go through a quick review before going live. You can manage it from your dashboard anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Photos ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            Photos <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">First image becomes the main photo. Upload up to 5.</p>
          <ImageUpload images={images} onChange={setImages} maxImages={5} />
        </section>

        {/* ── Basic info ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Basic information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Listing title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Natural Pigeon Blood Ruby – Unheated 3.2 ct"
              className="input-field"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gem type <span className="text-red-500">*</span>
              </label>
              <select {...register('gemType')} className="input-field">
                <option value="">Select type…</option>
                {GEM_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gemType && <p className="text-xs text-red-500 mt-1">{errors.gemType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Asking price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number" min="1" step="0.01"
                  placeholder="0.00"
                  className="input-field pl-7"
                />
              </div>
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Describe the gemstone — treatments, history, certificate details, special features…"
              className="input-field resize-none"
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-xs text-red-500">{errors.description.message}</p>
                : <span />}
              <span className={`text-xs ${descLength < 20 ? 'text-gray-400' : 'text-green-600'}`}>
                {descLength} chars
              </span>
            </div>
          </div>
        </section>

        {/* ── Gem specifications ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Gem specifications</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Carat weight <span className="text-red-500">*</span>
              </label>
              <input
                {...register('carat', { valueAsNumber: true })}
                type="number" step="0.01" min="0.01"
                placeholder="e.g. 3.20"
                className="input-field"
              />
              {errors.carat && <p className="text-xs text-red-500 mt-1">{errors.carat.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                {...register('color')}
                placeholder="e.g. Pigeon Blood Red"
                className="input-field"
              />
              {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Clarity <span className="text-red-500">*</span>
              </label>
              <select {...register('clarity')} className="input-field">
                <option value="">Select clarity…</option>
                {CLARITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.clarity && <p className="text-xs text-red-500 mt-1">{errors.clarity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cut <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                {...register('cut')}
                placeholder="e.g. Oval, Cushion, Round Brilliant"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Origin <span className="text-red-500">*</span>
              </label>
              <input
                {...register('origin')}
                placeholder="e.g. Myanmar, Sri Lanka, Colombia"
                className="input-field"
              />
              {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin.message}</p>}
            </div>
          </div>

          {/* Certified toggle */}
          <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
            <Controller
              name="isCertified"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="isCertified"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 mt-0.5 text-gem-600 rounded border-gray-300 focus:ring-gem-300"
                />
              )}
            />
            <div>
              <label htmlFor="isCertified" className="text-sm font-medium text-gray-700 cursor-pointer">
                This gem has an official certification
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                GIA, GRS, AGL, Gübelin, SSEF, or other recognised lab
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact & location ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Contact & location</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                WhatsApp number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('whatsappNumber')}
                placeholder="e.g. 94771234567"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Include country code. Number is kept private — buyers get a link only.</p>
              {errors.whatsappNumber && <p className="text-xs text-red-500 mt-1">{errors.whatsappNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your location <span className="text-red-500">*</span>
              </label>
              <select {...register('location')} className="input-field">
                <option value="">Select location…</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
            : 'Submit listing for review'}
        </button>

        <p className="text-xs text-center text-gray-400">
          By submitting you confirm this listing is accurate and complies with our terms.
        </p>
      </form>
    </div>
  )
}
