'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Image from 'next/image'

function VerifyContent() {
  const { login }  = useAuth()
  const router     = useRouter()
  const params     = useSearchParams()
  const token      = params.get('token')
  const userId     = params.get('userId')

  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [linkStatus, setLinkStatus] = useState(token ? 'verifying' : null) // verifying | error

  // Nothing to work with → back to register
  useEffect(() => {
    if (!token && !userId) router.push('/register')
  }, [token, userId, router])

  // Auto-verify when arriving via the email link (?token=…)
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const res    = await fetch('/api/auth/verify-token', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token }),
        })
        const result = await res.json()
        if (cancelled) return
        if (result.success) {
          login(result.data.user, result.data.token)
          toast.success('Email verified! Welcome to GGMP 🎉')
          router.push('/')
        } else {
          setLinkStatus('error')
        }
      } catch {
        if (!cancelled) setLinkStatus('error')
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Countdown timer for the "resend" button (code mode)
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleVerify(e) {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      const res    = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, code }),
      })
      const result = await res.json()
      if (result.success) {
        login(result.data.user, result.data.token)
        toast.success('Email verified! Welcome to GGMP 🎉')
        router.push('/')
      } else {
        toast.error(result.error || 'Invalid code')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const res    = await fetch('/api/auth/resend-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('New verification link sent to your email')
        setCountdown(60)
        setCode('')
      } else {
        toast.error(result.error || 'Failed to resend')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  // ── Link mode: verifying / error ──────────────────────────────
  if (token) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Image
            src="https://res.cloudinary.com/dapowzg6d/image/upload/v1778816597/Copilot_20260515_104255_a6in1o.png"
            alt="GGMP Logo" width={80} height={80}
            className="object-contain mx-auto mb-6"
          />
          {linkStatus === 'verifying' ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <Loader2 size={32} className="text-gem-500 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900">Verifying your email…</h1>
              <p className="text-gray-500 mt-1 text-sm">This will only take a moment.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <XCircle size={40} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900">Link expired or invalid</h1>
              <p className="text-gray-500 mt-2 text-sm">
                This verification link has expired or already been used. Sign in and we'll send you a fresh one.
              </p>
              <Link href="/login" className="mt-6 inline-block btn-primary px-6 py-2.5">
                Go to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Code mode: link sent, code entry optional ────────────────
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="https://res.cloudinary.com/dapowzg6d/image/upload/v1778816597/Copilot_20260515_104255_a6in1o.png"
            alt="GGMP Logo" width={80} height={80}
            className="object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We sent a verification link to your email — just <strong>click it</strong> to verify your account.<br />
            It expires in <strong>1 hour</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3 mb-6">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700">Open your inbox and tap “Verify my email”.</p>
          </div>

          <div className="relative text-center mb-5">
            <span className="bg-white px-3 text-xs text-gray-400 relative z-10">or enter the code manually</span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="input-field text-center text-2xl font-bold tracking-[0.5em]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                : 'Verify with code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the email?</p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm text-gem-600 hover:text-gem-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resending
                ? 'Sending…'
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend verification link'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
            Check your spam folder if you don't see the email
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="text-gem-500 animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
