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
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  phone:    z.string()
             .regex(/^\+[1-9]\d{6,14}$/, 'Phone must include country code e.g. +94771234567')
             .optional()
             .or(z.literal('')),
  whatsapp: z.string()
             .regex(/^\+[1-9]\d{6,14}$/, 'WhatsApp must include country code e.g. +94771234567')
             .optional()
             .or(z.literal('')),
  telegram: z.string()
             .regex(/^@?[a-zA-Z0-9_]{4,32}$/, 'Enter a valid Telegram username e.g. @username')
             .optional()
             .transform(v => v || null),

  line:     z.string()
             .min(4, 'Line ID must be at least 4 characters')
             .optional()
             .transform(v => v || null),
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
          name:     data.data.name,
          phone:    data.data.phone    || '',
          whatsapp: data.data.whatsapp || '',
          telegram: data.data.telegram || '',
          line:     data.data.line     || '',
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

            {/* Social contacts */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-4">
              Social contacts
              <span className="ml-2 text-xs font-normal text-gray-400">(optional)</span>
            </p>

            <div className="space-y-4">

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </span>
                </label>
                <input
                  {...registerProfile('whatsapp')}
                  type="tel"
                  placeholder="+94771234567"
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">Include country code</p>
                {profileErrors.whatsapp && (
                  <p className="text-xs text-red-500 mt-1">{profileErrors.whatsapp.message}</p>
                )}
              </div>

              {/* Telegram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </span>
                </label>
                <input
                  {...registerProfile('telegram')}
                  type="text"
                  placeholder="@username"
                  className="input-field"
                />
                {profileErrors.telegram && (
                  <p className="text-xs text-red-500 mt-1">{profileErrors.telegram.message}</p>
                )}
              </div>

              {/* Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    Line
                  </span>
                </label>
                <input
                  {...registerProfile('line')}
                  type="text"
                  placeholder="Your Line ID"
                  className="input-field"
                />
                {profileErrors.line && (
                  <p className="text-xs text-red-500 mt-1">{profileErrors.line.message}</p>
                )}
              </div>

            </div>
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