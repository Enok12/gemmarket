'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Routes incoming Android App Link / iOS Universal Link opens to the right
 * in-app page instead of letting them fall through to a browser.
 *
 * Only does anything inside the Capacitor native shell — on the plain web the
 * plugin isn't available and this is a no-op.
 */
export default function DeepLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    let listener

    async function attach() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return

        const { App } = await import('@capacitor/app')

        listener = await App.addListener('appUrlOpen', ({ url }) => {
          try {
            const { pathname, search } = new URL(url)
            router.push(`${pathname}${search}`)
          } catch {
            // Malformed URL — ignore rather than crash the app.
          }
        })
      } catch {
        // Plugin unavailable (web build) — nothing to do.
      }
    }

    attach()
    return () => { listener?.remove() }
  }, [router])

  return null
}
