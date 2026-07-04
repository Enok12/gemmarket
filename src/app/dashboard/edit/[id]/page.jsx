'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'
import { GEM_TYPES, LOCATIONS, CLARITY_OPTIONS } from '@/lib/utils'
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import VideoUpload from '@/components/VideoUpload'


const schema = z.object({
  title:          z.string().min(5, 'Title must be at least 5 characters'),
  priceOnInquiry: z.boolean().default(false),
  price:          z.preprocess(
                    (v) => (v === '' || v === null || Number.isNaN(v) ? undefined : v),
                    z.number({ invalid_type_error: 'Enter a valid price' }).positive().optional()
                  ),
  gemType:        z.string().min(1, 'Select a gem type'),
  stoneType:      z.enum(['ROUGH', 'CUT_AND_POLISHED']).default('CUT_AND_POLISHED'),
  carat:          z.number({ invalid_type_error: 'Enter a valid carat weight' }).positive(),
  color:          z.string().min(1),
  clarity:        z.string().optional(),
  cut:            z.string().optional(),
  origin:         z.string().optional(),
  description:    z.string().min(20, 'Description must be at least 20 characters'),
  whatsappNumber: z.string().min(7),
  telegram: z.string().nullable().optional().transform(v => v || null),
  line:     z.string().nullable().optional().transform(v => v || null),
  location:       z.string().optional(),
  isCertified:    z.boolean().default(false),
  availability:   z.enum(['Available', 'Sold']).default('Available'),

}).refine((d) => d.priceOnInquiry || (typeof d.price === 'number' && d.price > 0), {
  message: 'Enter a valid price or select Price on Inquiry',
  path: ['price'],
})

export default function EditListingPage() {
  const { user, token } = useAuth()
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id

  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [images, setImages]     = useState([])
  const [originalStatus, setOriginalStatus] = useState(null)
  const [video, setVideo]   = useState(null)   // ← add this


  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
  })
  const priceOnInquiry = watch('priceOnInquiry')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchListing()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  async function fetchListing() {
    try {
      const res  = await fetch(`/api/listings/${id}`)
      const data = await res.json()

      if (!data.success) {
        toast.error('Listing not found')
        router.push('/dashboard')
        return
      }

      const l = data.data

      // Only owner or admin can edit
      if (l.user.id !== user?.id && user?.role !== 'ADMIN') {
        toast.error('Not authorised to edit this listing')
        router.push('/dashboard')
        return
      }

      setOriginalStatus(l.status)

      reset({
        title:          l.title,
        priceOnInquiry: l.price === null,
        price:          l.price ?? undefined,
        gemType:        l.gemType,
        stoneType:      l.stoneType || 'CUT_AND_POLISHED',
        carat:          l.carat,
        color:          l.color,
        clarity:        l.clarity  || '',
        cut:            l.cut      || '',
        origin:         l.origin   || '',
        description:    l.description,
        whatsappNumber: l.whatsappNumber,
        telegram:       l.telegram || '',
        line:           l.line     || '',
        location:       l.location || '',
        isCertified:    l.isCertified,
        availability:   l.availability || 'Available',

      })

      setImages(l.images.map((i) => ({ url: i.imageUrl, publicId: i.publicId || '' })))
      if (l.videos?.length) {
      setVideo({ url: l.videos[0].videoUrl, publicId: l.videos[0].publicId || '' })
}
    } catch {
      toast.error('Failed to load listing')
      router.push('/dashboard')
    } finally {
      setFetching(false)
    }
  }

  async function onSubmit(data) {
    setLoading(true)
    try {
      const res    = await fetch(`/api/listings/${id}`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          price:    data.priceOnInquiry ? null : data.price,
          images: images.map((img) => ({ imageUrl: img.url, publicId: img.publicId })),
          videos: video ? [{ videoUrl: video.url, publicId: video.publicId }] : [],
        }),
      })
      const result = await res.json()

      if (result.success) {
        const resubmitted = result.data.status === 'PENDING' && originalStatus === 'APPROVED'
        toast.success(
          resubmitted
            ? 'Listing updated and sent for re-review.'
            : 'Listing updated!'
        )
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Update failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="text-gem-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard"
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit listing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Changes to title, price, or description will require re-approval</p>
        </div>
      </div>

      {/* Re-approval notice */}
      {originalStatus === 'APPROVED' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            This listing is currently live. Editing core fields will send it back for review and temporarily hide it from buyers.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const first = Object.values(formErrors)[0]
          toast.error(first?.message || 'Please fix the highlighted fields')
        })}
        className="space-y-6"
      >

        {/* Photos */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Photos</h2>
          <ImageUpload images={images} onChange={setImages} maxImages={5} />
        </section>

        {/* Video */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            Video <span className="text-gray-400 font-normal">(optional)</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Upload a short video showcasing the gem. Max 50 MB.</p>
          <VideoUpload video={video} onChange={setVideo} />
        </section>

        {/* Basic info */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Basic information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input {...register('title')} className="input-field" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Stone type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stone type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'CUT_AND_POLISHED', label: 'Cut & Polished', desc: 'Finished, faceted gem' },
                { value: 'ROUGH',            label: 'Rough Stone',    desc: 'Uncut, natural rough' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-2.5 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-gem-300 has-[:checked]:border-gem-500 has-[:checked]:bg-gem-50 transition-colors"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('stoneType')}
                    className="mt-0.5 text-gem-600 focus:ring-gem-300"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
                    <span className="block text-xs text-gray-500">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.stoneType && <p className="text-xs text-red-500 mt-1">{errors.stoneType.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gem type</label>
              <select {...register('gemType')} className="input-field">
                {GEM_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Price (USD) {!priceOnInquiry && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number" step="0.01"
                  disabled={priceOnInquiry}
                  className={`input-field pl-7 ${priceOnInquiry ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.price && !priceOnInquiry && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
              <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  {...register('priceOnInquiry')}
                  onChange={(e) => {
                    register('priceOnInquiry').onChange(e)
                    if (e.target.checked) setValue('price', undefined)
                  }}
                  className="rounded border-gray-300 text-gem-600 focus:ring-gem-300"
                />
                <span className="text-sm text-gray-600">Price on Inquiry <span className="text-gray-400">(hide price from buyers)</span></span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={5} className="input-field resize-none" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
        </section>

        {/* Gem specs */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Gem specifications</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Carat weight</label>
              <input {...register('carat', { valueAsNumber: true })} type="number" step="0.01" className="input-field" />
              {errors.carat && <p className="text-xs text-red-500 mt-1">{errors.carat.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
              <input {...register('color')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Clarity</label>
              <select {...register('clarity')} className="input-field">
                <option value="">Select clarity… (optional)</option>
                {CLARITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cut</label>
              <input {...register('cut')} className="input-field" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Origin</label>
              <input {...register('origin')} className="input-field" />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
            <select {...register('availability')} className="input-field">
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
            <Controller
              name="isCertified"
              control={control}
              render={({ field }) => (
                <input type="checkbox" id="isCertified" checked={field.value} onChange={field.onChange}
                  className="w-4 h-4 mt-0.5 text-gem-600 rounded" />
              )}
            />
            <label htmlFor="isCertified" className="text-sm font-medium text-gray-700 cursor-pointer">
              This gem has an official certification
            </label>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Contact & location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp number</label>
              <input {...register('whatsappNumber')} className="input-field" placeholder="+94771234567" />
              {errors.whatsappNumber && <p className="text-xs text-red-500 mt-1">{errors.whatsappNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <select {...register('location')} className="input-field">
                <option value="">Select location… (optional)</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telegram <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input {...register('telegram')} type="text" placeholder="@username" className="input-field" />
              {errors.telegram && <p className="text-xs text-red-500 mt-1">{errors.telegram.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Line ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input {...register('line')} type="text" placeholder="Your Line ID" className="input-field" />
              {errors.line && <p className="text-xs text-red-500 mt-1">{errors.line.message}</p>}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1 btn-secondary py-3 text-center">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
              : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
