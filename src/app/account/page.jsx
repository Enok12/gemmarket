'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, Shield, Calendar,
  Edit3, Lock, Loader2, Package,
  Eye, MessageCircle, Clock, CheckCircle,LogOut
} from 'lucide-react'

import { useLogout } from '@/hooks/useLogout'

const profileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string()
           .regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code e.g. +94771234567')
           .optional()
           .or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

export default function AccountPage() {
  const { user, token, login, isLoading } = useAuth()
  const router = useRouter()
  const { confirmLogout } = useLogout()


  const [profile, setProfile]           = useState(null)
  const [fetching, setFetching]         = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [activeTab, setActiveTab]       = useState('profile')

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({ resolver: zodResolver(profileSchema) })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.push('/login'); return }
    fetchProfile()
  }, [user, isLoading])

  async function fetchProfile() {
    setFetching(true)
    try {
      const res  = await fetch('/api/account', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        resetProfile({
          name:  data.data.name,
          phone: data.data.phone || '',
        })
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setFetching(false)
    }
  }

  async function onProfileSubmit(data) {
    setSavingProfile(true)
    try {
      const res    = await fetch('/api/account', {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'profile', ...data }),
      })
      const result = await res.json()
      if (result.success) {
        setProfile((prev) => ({ ...prev, ...result.data }))
        login({ ...user, name: result.data.name }, token)
        toast.success('Profile updated successfully')
      } else {
        toast.error(result.error || 'Update failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingProfile(false)
    }
  }

  async function onPasswordSubmit(data) {
    setSavingPassword(true)
    try {
      const res    = await fetch('/api/account', {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'password', ...data }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Password updated successfully')
        resetPassword()
      } else {
        toast.error(result.error || 'Update failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingPassword(false)
    }
  }

  if (isLoading || fetching) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="text-gem-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const TABS = [
    { key: 'profile',  label: 'Profile',  icon: <User size={15} /> },
    { key: 'password', label: 'Password', icon: <Lock size={15} /> },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gem-100 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-gem-700 text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{user.email}</span>
            {profile?.isVerified ? (
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle size={10} /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock size={10} /> Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {profile?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total listings',  value: profile.stats.totalListings,   icon: <Package size={16} />,       color: 'text-gray-500'   },
            { label: 'Live listings',   value: profile.stats.liveListings,    icon: <Eye size={16} />,           color: 'text-green-600'  },
            { label: 'Pending',         value: profile.stats.pendingListings, icon: <Clock size={16} />,         color: 'text-amber-600'  },
            { label: 'WhatsApp clicks', value: profile.stats.whatsappClicks,  icon: <MessageCircle size={16} />, color: 'text-gem-600'    },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className={`flex items-center gap-1.5 ${color} text-xs mb-2`}>{icon}{label}</div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Personal information</h2>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-2"><User size={14} /> Full name</span>
              </label>
              <input {...registerProfile('name')} className="input-field" />
              {profileErrors.name && (
                <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>
              )}
            </div>

            {/* Email — read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-2"><Mail size={14} /> Email address</span>
              </label>
              <input
                value={profile?.email || ''}
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-2"><Phone size={14} /> Phone number</span>
              </label>
              <input
                {...registerProfile('phone')}
                type="tel"
                placeholder="+94771234567"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Include country code e.g. +94 for Sri Lanka</p>
              {profileErrors.phone && (
                <p className="text-xs text-red-500 mt-1">{profileErrors.phone.message}</p>
              )}
            </div>

            {/* Member since */}
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
              <Calendar size={14} />
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary py-3 flex items-center justify-center gap-2 w-full"
            >
              {savingProfile
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : <><Edit3 size={15} /> Save changes</>}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {activeTab === 'password' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Change password</h2>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
              <input
                {...registerPassword('currentPassword')}
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <input
                {...registerPassword('newPassword')}
                type="password"
                placeholder="Min. 8 characters"
                className="input-field"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
              <input
                {...registerPassword('confirmPassword')}
                type="password"
                placeholder="Repeat new password"
                className="input-field"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary py-3 flex items-center justify-center gap-2 w-full"
            >
              {savingPassword
                ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
                : <><Lock size={15} /> Update password</>}
            </button>
          </form>
        </div>
      )}

       {/* Logout — mobile only */}
      <div className="mt-6 lg:hidden">
        <button
          onClick={confirmLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

    </div>
  )
}