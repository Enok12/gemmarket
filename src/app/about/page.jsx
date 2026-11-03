import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { Search, ShieldCheck, MessageCircle, Globe2, Gem, FileCheck2 } from 'lucide-react'

export const metadata = {
  title: 'About Us — GGMP Global Gem Marketplace',
  description:
    'GGMP connects gemstone sellers and buyers worldwide. Browse rough and cut gemstones, review every listing, and deal directly with the seller.',
}

const features = [
  {
    icon: Gem,
    title: 'Rough and cut stones',
    text: 'Rubies, sapphires, emeralds and more, listed as rough or as cut and polished stones, each with its carat weight, colour, clarity, cut and origin.',
  },
  {
    icon: ShieldCheck,
    title: 'Reviewed before they go live',
    text: 'Every new listing is checked by our team before it appears, so the marketplace stays clear of spam and junk.',
  },
  {
    icon: FileCheck2,
    title: 'Certification details',
    text: 'Sellers can state whether a lab certificate is available and attach an image of it, so buyers can see what backs the stone.',
  },
  {
    icon: Globe2,
    title: 'Sellers around the world',
    text: 'Search by gemstone, stone type or country to find stones from the trading centres and mining regions you care about.',
  },
  {
    icon: MessageCircle,
    title: 'Talk to the seller directly',
    text: 'Buyers contact the seller on WhatsApp, Telegram or Line, whichever the seller prefers. Price and terms are agreed between the two of you.',
  },
  {
    icon: Search,
    title: 'Photos and video',
    text: 'Listings carry multiple photos and video, so you can examine a stone closely before you reach out.',
  },
]

const steps = [
  {
    title: 'Sellers list a stone',
    text: 'Create a free account, add photos, details and your preferred contact channel.',
  },
  {
    title: 'We review the listing',
    text: 'Our team checks the listing, and approved stones go live on the marketplace.',
  },
  {
    title: 'Buyers get in touch',
    text: 'Buyers browse, filter and message the seller directly to discuss the stone.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <section className="anim-fade-up text-center mb-14">
        <p className="text-sm font-semibold tracking-wide text-gem-600 uppercase mb-3">About GGMP</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          A marketplace built for gemstones
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          GGMP — Global Gem Marketplace — brings gemstone sellers and buyers together in one place,
          so finding a stone, or finding a buyer for one, doesn't depend on who you happen to know.
        </p>
      </section>

      {/* Mission */}
      <section className="anim-fade-up anim-d2 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-14">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Why we exist</h2>
        <p className="text-gray-600 leading-relaxed">
          The gem trade has long run on personal introductions and scattered chat groups. That makes
          good stones hard to find and good sellers hard to reach. GGMP gives every seller a
          proper listing and every buyer one place to search, compare and make contact.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          We don't hold stones, set prices or take part in the deal. GGMP is the place where the
          two sides meet, and the transaction itself stays between you and the seller.
        </p>
      </section>

      {/* Features */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What you can do on GGMP</h2>
        <Reveal stagger className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-gem-50 text-gem-600 flex items-center justify-center mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* How it works */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How it works</h2>
        <Reveal>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="bg-white border border-gray-200 rounded-2xl p-5">
                <span className="inline-flex w-8 h-8 rounded-full bg-gem-600 text-white text-sm font-semibold items-center justify-center mb-3">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Buying safely */}
      <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 mb-14">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Buy with care</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Ask for a lab certificate for any stone of significant value.</li>
          <li>Request extra photos or a video of the exact stone before you commit.</li>
          <li>Agree on price, payment method and shipping in writing before you pay.</li>
          <li>See something suspicious? Tell us at <a href="mailto:support@ggmp.app" className="text-gem-600 hover:underline">support@ggmp.app</a>.</li>
        </ul>
      </section>

      {/* Call to action */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to start?</h2>
        <p className="text-gray-600 mb-6">Browse the latest stones or list one of your own.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gem-600 text-white font-medium hover:bg-gem-700 transition-colors"
          >
            Browse gemstones
          </Link>
          <Link
            href="/create"
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            List a stone
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Questions? Write to us at{' '}
          <a href="mailto:support@ggmp.app" className="text-gem-600 hover:underline">support@ggmp.app</a>
        </p>
      </section>

    </div>
  )
}
