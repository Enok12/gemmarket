import Link from 'next/link'
import { Gem } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gem-50 rounded-2xl mb-6">
          <Gem size={28} className="text-gem-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-2">Page not found</p>
        <p className="text-sm text-gray-400 mb-8">
          The gem you're looking for has been cut and polished elsewhere.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"         className="btn-primary px-6 py-2.5">Go home</Link>
          <Link href="/listings" className="btn-secondary px-6 py-2.5">Browse listings</Link>
        </div>
      </div>
    </div>
  )
}
