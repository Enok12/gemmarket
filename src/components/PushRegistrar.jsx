'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * Registers this device for push notifications once the user is logged in,
 * and routes taps on a notification to the relevant listing.
 *
 * No-op on the web (and before Firebase is configured in the native build).
 */
export default function PushRegistrar() {
  const { user, token } = useAuth()
  const router = useRouter()
  const registered = useRef(false)

  useEffect(() => {
    if (!user || !token || registered.current) return

    let listeners = []

    ;(async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return
        if (!Capacitor.isPluginAvailable('PushNotifications')) return

        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Android 13+ requires an explicit runtime permission.
        let perm = await PushNotifications.checkPermissions()
        if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
          perm = await PushNotifications.requestPermissions()
        }
        if (perm.receive !== 'granted') return

        listeners.push(
          await PushNotifications.addListener('registration', async ({ value }) => {
            try {
              await fetch('/api/push/register', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body:    JSON.stringify({ token: value, platform: Capacitor.getPlatform() }),
              })
              registered.current = true
            } catch {
              // Non-fatal — the user simply won't get pushes this session.
            }
          })
        )

        listeners.push(
          await PushNotifications.addListener('registrationError', (e) => {
            console.error('Push registration failed:', e)
          })
        )

        // Tapping a notification opens the relevant listing.
        listeners.push(
          await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
            const listingId = notification?.data?.listingId
            const type      = notification?.data?.type
            if (listingId && type === 'LISTING_PENDING') router.push('/admin')
            else if (listingId)                          router.push(`/listings/${listingId}`)
          })
        )

        await PushNotifications.register()
      } catch (e) {
        console.error('Push setup failed:', e)
      }
    })()

    return () => { listeners.forEach((l) => l?.remove?.()) }
  }, [user, token, router])

  return null
}
