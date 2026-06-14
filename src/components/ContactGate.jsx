'use client'
import { useAuth } from '@/hooks/useAuth'

export default function ContactGate({ children }) {
  const { user } = useAuth()

  if (user) return children

  return (
    <div className="relative group cursor-not-allowed">
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        Sign up free to contact the seller
      </div>
    </div>
  )
}
