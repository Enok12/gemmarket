'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePostGemButton() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLoggedIn = mounted ? !!user : false
  const targetHref = isLoggedIn ? '/create' : '/register'

  const handleClick = (e) => {
    try {
      const token = localStorage.getItem('gem_token')
      const savedUser = localStorage.getItem('gem_user')
      if (token && savedUser) {
        e.preventDefault()
        router.push('/create')
      }
    } catch {
      // ignore
    }
  }

  return (
    <Link
      href={targetHref}
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gem-700 font-semibold text-lg rounded-xl hover:bg-gem-50 transition-colors"
    >
      Post your GEM — it&apos;s free
    </Link>
  )
}
