'use server'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/db'
import { pushSubscriptions } from '@/db/schema'

export async function subscribePush(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')

  await db
    .insert(pushSubscriptions)
    .values({
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    })
    .onConflictDoNothing({ target: pushSubscriptions.endpoint })
}

export async function unsubscribePush(endpoint: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.userId, session.user.id),
      ),
    )
}
