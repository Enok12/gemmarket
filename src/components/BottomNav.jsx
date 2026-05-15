'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Home, ShoppingBag, Tag, User, LayoutDashboard,
  ShieldCheck, LogOut, Search
} from 'lucide-react'

export default function BottomNav() {
  const { user, isAdmin, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  function handleLogout() {
    logout()
    router.push('/')
  }

  function isActive(href) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  if (isLoading) return null

  // ── Nav items per role ──────────────────────────────────────
  const guestItems = [
    { label: 'Home',    icon: <Home size={20} />,         href: '/'         },
    { label: 'Buy',     icon: <ShoppingBag size={20} />,  href: '/listings' },
    { label: 'Sell',    icon: <Tag size={22} />,           href: '/register', center: true },
    { label: 'Account', icon: <User size={20} />,         href: '/login'    },
  ]

  const sellerItems = [
    { label: 'Home',      icon: <Home size={20} />,            href: '/'          },
    { label: 'Listings',  icon: <Search size={20} />,          href: '/listings'  },
    { label: 'Sell',      icon: <Tag size={22} />,              href: '/create',   center: true },
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Logout',    icon: <LogOut size={20} />,          action: handleLogout },
  ]

  const adminItems = [
    { label: 'Home',     icon: <Home size={20} />,         href: '/'       },
    { label: 'Listings', icon: <Search size={20} />,       href: '/listings' },
    { label: 'Sell',     icon: <Tag size={22} />,           href: '/create', center: true },
    { label: 'Admin',    icon: <ShieldCheck size={20} />,  href: '/admin'  },
    { label: 'Logout',   icon: <LogOut size={20} />,       action: handleLogout },
  ]

  const items = !user ? guestItems : isAdmin ? adminItems : sellerItems

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] pb-safe">
      <div className="flex items-end justify-around px-2 h-16">
        {items.map((item) => {
          const active = item.href ? isActive(item.href) : false

          // ── Center Sell button ──
          if (item.center) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 bg-gem-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gem-700 transition-colors">
                  <span className="text-white">{item.icon}</span>
                </div>
                <span className="text-xs text-gem-600 font-medium mt-1">{item.label}</span>
              </Link>
            )
          }

          // ── Action button (Logout) ──
          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
              >
                <span className="text-red-500">{item.icon}</span>
                <span className="text-xs text-red-500 font-medium">{item.label}</span>
              </button>
            )
          }

          // ── Regular nav item ──
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
            >
              <span className={active ? 'text-gem-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-gem-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}