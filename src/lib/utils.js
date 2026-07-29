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
  if (price === null || price === undefined) return 'Price on Inquiry'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function buildWhatsAppLink(number, listingTitle, listingId) {
  if (!number) return null
  const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}`
  const message = encodeURIComponent(
    `Hello, I'm interested in your listing: "${listingTitle}". Is it still available?\n\nView listing: ${listingUrl}`
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

const GEM_TYPE_LIST = [
  'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Alexandrite', 'Chrysoberyl',
  'Spinel', 'Garnet', 'Tourmaline', 'Topaz', 'Zircon', 'Quartz',
  'Aquamarine', 'Morganite', 'Heliodor', 'Moonstone', 'Sunstone', 'Labradorite',
  'Opal', 'Jade', 'Pearl', 'Coral', 'Amber', 'Peridot',
  'Tanzanite', 'Kunzite', 'Iolite', 'Andalusite', 'Kyanite', 'Apatite',
  'Fluorite', 'Sphene', 'Diopside', 'Danburite', 'Benitoite', 'Larimar',
  'Sugilite', 'Rhodonite', 'Rhodochrosite', 'Prehnite', 'Serpentine', 'Zoisite',
  'Scapolite', 'Vesuvianite', 'Hemimorphite', 'Smithsonite', 'Charoite', 'Bloodstone',
  'Amazonite', 'Turquoise', 'Malachite', 'Azurite', "Tiger's Eye", 'Pietersite',
  'Obsidian', 'Agate', 'Onyx', 'Carnelian', 'Jasper', 'Chalcedony',
  'Amethyst',
]

// Alphabetical, with 'Other' kept last as the catch-all option
export const GEM_TYPES = [
  ...GEM_TYPE_LIST.sort((a, b) => a.localeCompare(b)),
  'Other',
]


export const LOCATIONS = [
  'Colombo', 'Ratnapura', 'Galle', 'Kandy', 'Matara',
  'Kurunegala', 'Anuradhapura', 'Trincomalee', 'Jaffna', 'Other',
]

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso',
  'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe',
]

export const TREATMENT_OPTIONS = ['Natural', 'Heated', 'Unheated']

export const CERTIFICATION_OPTIONS = ['Available', 'On request', 'Not available']

export const CUT_OPTIONS = [
  'Round', 'Heart', 'Radiant', 'Princess', 'Asscher', 'Cushion',
  'Pear', 'Emerald', 'Oval', 'Marquise', 'Other',
]

export const CLARITY_OPTIONS = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2',
  'SI1', 'SI2', 'I1', 'I2', 'Eye Clean',
  'Slightly Included', 'Moderately Included',
]
