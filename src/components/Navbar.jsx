'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Gem, Menu, X, LogOut, LayoutDashboard, ShieldCheck, PlusCircle } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/')
    setUserMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <div className="w-8 h-8 bg-gem-600 rounded-lg flex items-center justify-center">
              <Gem size={16} className="text-white" />
            </div>
            <span className="text-lg">GemMarket</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Browse Gems
            </Link>
            <Link href="/listings?certified=true" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Certified
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/create"
                  className="flex items-center gap-2 px-4 py-2 bg-gem-600 text-white text-sm font-medium rounded-lg hover:bg-gem-700 transition-colors">
                  <PlusCircle size={15} /> Post a Listing
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gem-100 rounded-full flex items-center justify-center">
                      <span className="text-gem-700 text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-24 truncate">{user.name}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={14} /> My Listings
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <ShieldCheck size={14} /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={14} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link href="/register"
                  className="px-4 py-2 bg-gem-600 text-white text-sm font-medium rounded-lg hover:bg-gem-700 transition-colors">
                  Sign up free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
          <Link href="/listings" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Browse Gems</Link>
          <Link href="/listings?certified=true" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Certified Only</Link>
          {user ? (
            <>
              <Link href="/create" className="block py-2 text-sm text-gem-600 font-medium" onClick={() => setMobileOpen(false)}>+ Post a Listing</Link>
              <Link href="/dashboard" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
              {isAdmin && <Link href="/admin" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
              <button onClick={handleLogout} className="block w-full text-left py-2 text-sm text-red-600">Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link href="/register" className="block py-2 text-sm text-gem-600 font-medium" onClick={() => setMobileOpen(false)}>Sign up free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
