export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ListingCard from '@/components/ListingCard'
import FilterBar from '@/components/FilterBar'
import { Search, Loader2, Package, SlidersHorizontal, X } from 'lucide-react'

function ListingsContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [listings, setListings]     = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchListings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  async function fetchListings() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/listings?${searchParams.toString()}`)
      const data = await res.json()
      if (data.success) {
        setListings(data.data.listings)
        setPagination(data.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    searchInput ? params.set('search', searchInput) : params.delete('search')
    params.delete('page')
    router.push(`/listings?${params.toString()}`)
  }

  function goToPage(page) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/listings?${params.toString()}`)
  }

  const activeGemType = searchParams.get('gemType')
  const activeSearch  = searchParams.get('search')
  const hasFilters    =
    searchParams.get('gemType') || searchParams.get('location') ||
    searchParams.get('certified') || searchParams.get('minPrice') ||
    searchParams.get('maxPrice')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {activeGemType ? `${activeGemType} Listings` : 'Browse Gemstones'}
        </h1>
        <p className="text-sm text-gray-500">
          {loading ? 'Loading…' : `${pagination?.total ?? 0} listings found`}
          {activeSearch && ` for "${activeSearch}"`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search gems, colors, origins…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gem-300 bg-white"
          />
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`lg:hidden flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
            hasFilters ? 'border-gem-400 bg-gem-50 text-gem-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showFilters ? <X size={15} /> : <SlidersHorizontal size={15} />}
          Filters {hasFilters && '•'}
        </button>
      </form>

      {/* Mobile filters panel */}
      {showFilters && (
        <div className="lg:hidden mb-6">
          <FilterBar />
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterBar />
        </aside>

        {/* Main grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="text-gem-500 animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package size={40} className="text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No listings found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
              <button
                onClick={() => router.push('/listings')}
                className="mt-4 btn-secondary"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - pagination.page) <= 2)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                          p === pagination.page
                            ? 'bg-gem-600 text-white border-gem-600'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="text-gem-500 animate-spin" />
      </div>
    }>
      <ListingsContent />
    </Suspense>
  )
}
