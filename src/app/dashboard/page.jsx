'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  PlusCircle, Edit3, Trash2, Loader2, Package,
  MessageCircle, Eye, Clock, CheckCircle, XCircle,
  TrendingUp, BarChart2,
} from 'lucide-react'

export default function DashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [listings, setListings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/dashboard'); return }
    fetchMyListings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function fetchMyListings() {
    setLoading(true)
    try {
      const res  = await fetch('/api/listings/mine', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(data.data.listings)
    } catch {
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res  = await fetch(`/api/listings/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setListings((prev) => prev.filter((l) => l.id !== id))
        toast.success('Listing deleted')
      } else {
        toast.error(data.error || 'Delete failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  // Derived stats
  const approved = listings.filter((l) => l.status === 'APPROVED').length
  const pending  = listings.filter((l) => l.status === 'PENDING').length
  const rejected = listings.filter((l) => l.status === 'REJECTED').length
  const clicks   = listings.reduce((s, l) => s + (l.tracking?.whatsappClicks ?? 0), 0)

  function StatusBadge({ status }) {
    const map = {
      APPROVED: { icon: <CheckCircle size={11} />, cls: 'bg-green-50 text-green-700' },
      PENDING:  { icon: <Clock size={11} />,        cls: 'bg-amber-50 text-amber-700' },
      REJECTED: { icon: <XCircle size={11} />,      cls: 'bg-red-50 text-red-600' },
    }
    const { icon, cls } = map[status] || map.PENDING
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
        {icon} {status}
      </span>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user.name}</p>
        </div>
        <Link href="/create"
          className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New listing
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total listings', value: listings.length, icon: <Package size={18} />,       color: 'text-gray-500' },
          { label: 'Live listings',  value: approved,        icon: <Eye size={18} />,            color: 'text-green-600' },
          { label: 'Pending review', value: pending,         icon: <Clock size={18} />,          color: 'text-amber-600' },
          { label: 'WhatsApp clicks',value: clicks,          icon: <MessageCircle size={18} />,  color: 'text-gem-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`flex items-center gap-2 ${color} mb-2`}>
              {icon}
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            My listings
            <span className="ml-2 text-xs font-normal text-gray-400">({listings.length})</span>
          </h2>
          {listings.length > 0 && (
            <span className="text-xs text-gray-400">
              {approved} live · {pending} pending · {rejected} rejected
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="text-gem-500 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <div className="w-14 h-14 bg-gem-50 rounded-2xl flex items-center justify-center mb-4">
              <Package size={24} className="text-gem-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No listings yet</p>
            <p className="text-sm text-gray-400 mb-5">Post your first gemstone and start reaching buyers</p>
            <Link href="/create" className="btn-primary">Post a listing</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listings.map((listing) => (
              <div key={listing.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">

                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">💎</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-gem-700">{formatPrice(listing.price)}</span>
                    <span className="text-xs text-gray-400">{listing.gemType}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status + clicks */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <StatusBadge status={listing.status} />
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MessageCircle size={12} /> {listing.tracking?.whatsappClicks ?? 0}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="p-2 text-gray-400 hover:text-gem-600 hover:bg-gem-50 rounded-lg transition-colors"
                    title="View listing"
                  >
                    <Eye size={15} />
                  </Link>
                  <Link
                    href={`/dashboard/edit/${listing.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit listing"
                  >
                    <Edit3 size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deletingId === listing.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Delete listing"
                  >
                    {deletingId === listing.id
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      {listings.length > 0 && (
        <div className="mt-6 bg-gem-50 border border-gem-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={16} className="text-gem-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gem-800">Tips to get more buyers</p>
              <ul className="text-xs text-gem-700 mt-1 space-y-0.5 list-disc list-inside">
                <li>Upload clear, high-resolution photos from multiple angles</li>
                <li>Add a gemological certificate to increase trust</li>
                <li>Write a detailed description including treatments and history</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
