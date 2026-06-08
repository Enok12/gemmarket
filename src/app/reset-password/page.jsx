'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const schema = z.object({
  code:            z.string().length(6, 'Enter the 6-digit code'),
  newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

function ResetPasswordContent() {
  const router      = useRouter()
  const params      = useSearchParams()
  const userId      = params.get('userId')

  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!userId) router.push('/forgot-password')
  }, [userId, router])

  // Countdown for resend button
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    setLoading(true)
    try {
      const res    = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId,
          code:        data.code,
          newPassword: data.newPassword,
        }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Password reset successfully! Please log in.')
        router.push('/login')
      } else {
        toast.error(result.error || 'Failed to reset password')
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
        toast.success('New reset code sent to your email')
        setCountdown(60)
      } else {
        toast.error(result.error || 'Failed to resend')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="https://res.cloudinary.com/dapowzg6d/image/upload/v1778816597/Copilot_20260515_104255_a6in1o.png"
            alt="GGMP Logo"
            width={80}
            height={80}
            className="object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Enter the 6-digit code sent to your email and set a new password.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* OTP code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reset code
              </label>
              <input
                {...register('code')}
                type="text"
                placeholder="000000"
                maxLength={6}
                className="input-field text-center text-2xl font-bold tracking-[0.5em]"
                autoFocus
              />
              {errors.code && (
                <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm new password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Repeat new password"
                className="input-field"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Resetting…</>
                : 'Reset password'}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm text-gem-600 hover:text-gem-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resending
                ? 'Sending…'
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend code'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
            Check your spam folder if you don't see the email
          </div>
        </div>

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="text-gem-500 animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}