import { NextResponse } from 'next/server'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function apiSuccess(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function buildWhatsAppLink(number, listingTitle) {
  const message = encodeURIComponent(
    `Hello, I'm interested in your listing: "${listingTitle}". Is it still available?`
  )
  const cleaned = number.replace(/\D/g, '')
  return `https://wa.me/${cleaned}?text=${message}`
}

export const gemTypeColors = {
  Ruby:        'bg-red-100 text-red-800',
  Sapphire:    'bg-blue-100 text-blue-800',
  Emerald:     'bg-green-100 text-green-800',
  Spinel:      'bg-pink-100 text-pink-800',
  Topaz:       'bg-amber-100 text-amber-800',
  Moonstone:   'bg-slate-100 text-slate-800',
  Amethyst:    'bg-purple-100 text-purple-800',
  Alexandrite: 'bg-teal-100 text-teal-800',
  Garnet:      'bg-rose-100 text-rose-800',
  Tourmaline:  'bg-lime-100 text-lime-800',
  Other:       'bg-gray-100 text-gray-800',
}

export function getGemColor(gemType) {
  return gemTypeColors[gemType] || gemTypeColors['Other']
}

export const GEM_TYPES = [
  'Ruby', 'Sapphire', 'Emerald', 'Spinel', 'Topaz',
  'Moonstone', 'Amethyst', 'Alexandrite', 'Garnet', 'Tourmaline', 'Other',
]

export const LOCATIONS = [
  'Colombo', 'Ratnapura', 'Galle', 'Kandy', 'Matara',
  'Kurunegala', 'Anuradhapura', 'Trincomalee', 'Jaffna', 'Other',
]

export const CLARITY_OPTIONS = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2',
  'SI1', 'SI2', 'I1', 'I2', 'Eye Clean',
  'Slightly Included', 'Moderately Included',
]
