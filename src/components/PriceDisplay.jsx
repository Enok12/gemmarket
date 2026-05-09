'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function PriceDisplay({ price }) {
  const { user } = useAuth()

  if (user) {
    return <p className="text-3xl font-bold text-gem-700">${price.toLocaleString()}</p>
  }

  return (
    <div>
      <p className="text-3xl font-bold text-gray-400 tracking-widest">••••••</p>
      <p className="text-xs text-gem-600 mt-1 font-medium">
        <Link href="/register" className="underline underline-offset-2">Sign up free</Link>
        {' '}to see the price
      </p>
    </div>
  )
}