'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function ContactGate({ children }) {
  const { user } = useAuth()
  const router   = useRouter()

  if (user) return children

  // Guests: keep the button looking normal, but intercept the click
  // (capture phase) and send them to Sign Up instead of contacting the seller.
  return (
    <div
      onClickCapture={(e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push('/register')
      }}
      className="contents"
    >
      {children}
    </div>
  )
}
