'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { GEM_TYPES, LOCATIONS } from '@/lib/utils'
import { SlidersHorizontal, X } from 'lucide-react'

export default function FilterBar() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    params.delete('page')
    router.push(`/listings?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = () => router.push('/listings')

  const hasFilters =
    searchParams.get('gemType')  ||
    searchParams.get('location') ||
    searchParams.get('certified') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice')

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <SlidersHorizontal size={15} /> Filters
        </span>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gem-600 hover:text-gem-800">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Gem Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Gem Type</label>
          <select
            value={searchParams.get('gemType') || ''}
            onChange={(e) => updateFilter('gemType', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gem-300"
          >
            <option value="">All types</option>
            {GEM_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Location</label>
          <select
            value={searchParams.get('location') || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gem-300"
          >
            <option value="">All locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Price range */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Price range (USD)</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Min"
              value={searchParams.get('minPrice') || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gem-300"
            />
            <input type="number" placeholder="Max"
              value={searchParams.get('maxPrice') || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gem-300"
            />
          </div>
        </div>

        {/* Certified */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="certified"
            checked={searchParams.get('certified') === 'true'}
            onChange={(e) => updateFilter('certified', e.target.checked ? 'true' : '')}
            className="w-4 h-4 text-gem-600 rounded"
          />
          <label htmlFor="certified" className="text-sm text-gray-700">Certified only</label>
        </div>
      </div>
    </div>
  )
}
