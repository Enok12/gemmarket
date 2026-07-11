'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  ShieldCheck, CheckCircle, XCircle, Clock,
  Eye, Loader2, Package, MessageCircle, Users, BarChart3, LayoutDashboard,
  ChevronLeft, ChevronRight, Search, X,
} from 'lucide-react'

const PAGE_SIZE = 20

const TABS = [
  { key: 'PENDING',  label: 'Pending review', statKey: 'pending'  },
  { key: 'APPROVED', label: 'Approved',        statKey: 'approved' },
  { key: 'REJECTED', label: 'Rejected',        statKey: 'rejected' },
]

export default function AdminPage() {
const { user, token, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('PENDING')
  const [actionId, setActionId] = useState(null)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [stats, setStats]       = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, clicks: 0, users: 0,
  })

  useEffect(() => {
  if (isLoading) return
  if (!user)     { router.push('/login'); return }
  if (!isAdmin)  { router.push('/');      return }
  loadAll()
}, [user, isAdmin, isLoading])

  // Reload listings whenever tab changes (after initial load)
  useEffect(() => {
    setPage(1)
    setSearch('')
    if (!loading) loadTab(tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function loadAll() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/listings?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        const all = data.data.listings
        setStats({
          total:    all.length,
          pending:  all.filter((l) => l.status === 'PENDING').length,
          approved: all.filter((l) => l.status === 'APPROVED').length,
          rejected: all.filter((l) => l.status === 'REJECTED').length,
          clicks:   all.reduce((s, l) => s + (l.tracking?.whatsappClicks ?? 0), 0),
        })
        setListings(all.filter((l) => l.status === tab))
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadTab(status) {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/listings?status=${status}&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(data.data.listings)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id, action) {
    setActionId(id)
    try {
      const res  = await fetch(`/api/admin/listings/${id}/${action}`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Listing ${action === 'approve' ? 'approved ✓' : 'rejected'}`)
        // Remove from current list + update stats
        setListings((prev) => prev.filter((l) => l.id !== id))
        setStats((prev) => ({
          ...prev,
          pending:  prev.pending  + (tab === 'PENDING'  ? -1 : 0),
          approved: prev.approved + (action === 'approve' ? 1 : tab === 'APPROVED' ? -1 : 0),
          rejected: prev.rejected + (action === 'reject'  ? 1 : tab === 'REJECTED' ? -1 : 0),
        }))
      } else {
        toast.error(data.error || 'Action failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setActionId(null)
    }
  }

  if (!user || !isAdmin) return null

  // Search by item code, title or carat (within the active tab)
  const query = search.trim().toLowerCase()
  const filtered = query
    ? listings.filter((l) =>
        (l.itemCode || '').toLowerCase().includes(query) ||
        l.title.toLowerCase().includes(query) ||
        String(l.carat).includes(query)
      )
    : listings

  // Pagination — 20 per page (over the filtered set)
  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage  = Math.min(page, totalPages)
  const pageStart    = (currentPage - 1) * PAGE_SIZE
  const pageListings = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

   {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gem-600 rounded-xl flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Review and manage all marketplace listings</p>
        </div>
      </div>

      {/* My Dashboard link — visible on mobile only */}
      <Link
        href="/dashboard"
        className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gem-50 text-gem-700 text-sm font-medium rounded-lg hover:bg-gem-100 transition-colors"
      >
        <LayoutDashboard size={15} /> My Dashboard
      </Link>
    </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total',    value: stats.total,    icon: <BarChart3 size={16} />,     color: 'text-gray-600'   },
          { label: 'Pending',  value: stats.pending,  icon: <Clock size={16} />,         color: 'text-amber-600'  },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle size={16} />,   color: 'text-green-600'  },
          { label: 'Rejected', value: stats.rejected, icon: <XCircle size={16} />,       color: 'text-red-600'    },
          { label: 'WA clicks',value: stats.clicks,   icon: <MessageCircle size={16} />, color: 'text-gem-600'    },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`flex items-center gap-1.5 ${color} text-xs font-medium mb-2`}>
              {icon} {label}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map(({ key, label, statKey }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              key === 'PENDING'  ? 'bg-amber-100 text-amber-700' :
              key === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                   'bg-red-100 text-red-700'
            }`}>
              {stats[statKey]}
            </span>
          </button>
        ))}
      </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by code, name or carat…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gem-300"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Listing rows */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="text-gem-500 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package size={36} className="text-gray-300 mb-3" />
            <p className="text-gray-500">No {tab.toLowerCase()} listings</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No listings match “{search}”</p>
            <p className="text-sm text-gray-400 mt-1">Try a different name or carat weight</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pageListings.map((listing) => (
              <div key={listing.id}
                className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors">

                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {listing.images?.[0] ? (
                    <Image src={listing.images[0].imageUrl} alt={listing.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">💎</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{listing.title}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                        {listing.itemCode && (
                          <span className="font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            {listing.itemCode}
                          </span>
                        )}
                        <span className="font-semibold text-gem-700">{formatPrice(listing.price)}</span>
                        <span>{listing.gemType}</span>
                        <span>{listing.carat} ct</span>
                        <span>{listing.location}</span>
                        {listing.isCertified && (
                          <span className="text-green-600 font-medium">✓ Certified</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-gray-400">
                        <span>
                          By <strong className="text-gray-600">{listing.user?.name}</strong>
                        </span>
                        <span>·</span>
                        <span>{listing.user?.email}</span>
                        <span>·</span>
                        <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle size={10} />
                          {listing.tracking?.whatsappClicks ?? 0} clicks
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/listings/${listing.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gem-600 hover:bg-gem-50 rounded-lg transition-colors"
                        title="Preview listing"
                      >
                        <Eye size={15} />
                      </Link>

                      {tab === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(listing.id, 'approve')}
                            disabled={actionId === listing.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionId === listing.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <CheckCircle size={12} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(listing.id, 'reject')}
                            disabled={actionId === listing.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionId === listing.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <XCircle size={12} />}
                            Reject
                          </button>
                        </>
                      )}

                      {tab === 'APPROVED' && (
                        <button
                          onClick={() => handleAction(listing.id, 'reject')}
                          disabled={actionId === listing.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} /> Take down
                        </button>
                      )}

                      {tab === 'REJECTED' && (
                        <button
                          onClick={() => handleAction(listing.id, 'approve')}
                          disabled={actionId === listing.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-600 text-xs font-medium rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="px-3 text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
