import { prisma } from './prisma'

/**
 * Sends push notifications via Firebase Cloud Messaging.
 *
 * Requires FIREBASE_SERVICE_ACCOUNT (the service-account JSON, as a single-line
 * string) in the environment. Until that is set this is a safe no-op, so the
 * app keeps working normally before Firebase is configured.
 */

let messagingPromise = null

async function getMessaging() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null
  if (messagingPromise) return messagingPromise

  messagingPromise = (async () => {
    try {
      const admin = await import('firebase-admin')
      const app = admin.apps?.length
        ? admin.apps[0]
        : admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
          })
      return admin.messaging(app)
    } catch (e) {
      console.error('Firebase init failed — pushes disabled:', e.message)
      return null
    }
  })()

  return messagingPromise
}

/**
 * Push a notification to every device belonging to the given user(s).
 * Never throws — a failed notification must not break the action that triggered it.
 *
 * @param {string|string[]} userIds
 * @param {{title:string, body:string, data?:Record<string,string>}} payload
 */
export async function sendPushToUsers(userIds, { title, body, data = {} }) {
  try {
    const messaging = await getMessaging()
    if (!messaging) return { sent: 0, skipped: true }

    const ids = Array.isArray(userIds) ? userIds : [userIds]
    if (!ids.length) return { sent: 0 }

    const devices = await prisma.deviceToken.findMany({
      where:  { userId: { in: ids } },
      select: { token: true },
    })
    if (!devices.length) return { sent: 0 }

    const tokens = devices.map((d) => d.token)
    const res = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      // FCM data values must all be strings.
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    })

    // Drop tokens FCM reports as permanently invalid (app uninstalled, etc.)
    const stale = []
    res.responses.forEach((r, i) => {
      const code = r.error?.code || ''
      if (!r.success && /registration-token-not-registered|invalid-argument/.test(code)) {
        stale.push(tokens[i])
      }
    })
    if (stale.length) {
      await prisma.deviceToken.deleteMany({ where: { token: { in: stale } } })
    }

    return { sent: res.successCount, failed: res.failureCount }
  } catch (e) {
    console.error('sendPushToUsers failed:', e)
    return { sent: 0, error: true }
  }
}

/** Notifies every admin — used when a new listing needs review. */
export async function sendPushToAdmins(payload) {
  try {
    const admins = await prisma.user.findMany({
      where:  { role: 'ADMIN' },
      select: { id: true },
    })
    return sendPushToUsers(admins.map((a) => a.id), payload)
  } catch (e) {
    console.error('sendPushToAdmins failed:', e)
    return { sent: 0, error: true }
  }
}
