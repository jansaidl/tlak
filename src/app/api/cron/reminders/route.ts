import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { and, eq, gte } from 'drizzle-orm'
import { subDays } from 'date-fns'
import { db } from '@/db'
import { users, pushSubscriptions, measurements, weightEntries } from '@/db/schema'

export const runtime = 'nodejs'

function configureWebPush(): boolean {
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:noreply@example.com'
  if (!pub || !priv) return false
  webpush.setVapidDetails(subject, pub, priv)
  return true
}

async function sendTo(userId: string, payload: { title: string; body: string; url?: string; tag?: string }) {
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        )
      } catch (err: any) {
        // Clean up dead subscriptions (410 Gone / 404 Not Found).
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, s.endpoint))
        }
      }
    }),
  )
}

// Hour-of-day (0-23) in a target timezone for a given instant.
function hourInTz(now: Date, tz: string): number {
  try {
    const hh = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      hour12: false,
    }).format(now)
    return Number(hh)
  } catch {
    return now.getUTCHours()
  }
}

function weekdayInTz(now: Date, tz: string): number {
  // 0 = Sunday .. 6 = Saturday
  try {
    const wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now)
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd)
  } catch {
    return now.getUTCDay()
  }
}

async function requireCronAuth(req: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const auth = req.headers.get('authorization') || ''
  if (auth === `Bearer ${secret}`) return true
  const url = new URL(req.url)
  return url.searchParams.get('token') === secret
}

async function run(req: Request) {
  if (!(await requireCronAuth(req))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!configureWebPush()) {
    return NextResponse.json({ error: 'vapid_not_configured' }, { status: 500 })
  }

  const now = new Date()
  const since24 = subDays(now, 1)
  const since7 = subDays(now, 7)

  const allUsers = await db.select().from(users)
  let sent = 0

  for (const u of allUsers) {
    const hour = hourInTz(now, u.timezone)
    const weekday = weekdayInTz(now, u.timezone)
    const isMorningWindow = hour === 8
    const isEveningWindow = hour === 20
    const isSundayMorning = weekday === 0 && hour === 10

    if (u.remindMorning && isMorningWindow) {
      const last = await db
        .select({ id: measurements.id })
        .from(measurements)
        .where(and(eq(measurements.userId, u.id), gte(measurements.measuredAt, since24)))
        .limit(1)
      if (!last[0]) {
        await sendTo(u.id, {
          title: u.locale === 'cs' ? 'Ranní měření' : 'Morning measurement',
          body:
            u.locale === 'cs'
              ? 'Než vezmeš prášky — 30 vteřin na tlak?'
              : 'Before your meds — 30 seconds to log?',
          url: `/${u.locale}/measurements`,
          tag: 'reminder-morning',
        })
        sent++
      }
    }

    if (u.remindEvening && isEveningWindow) {
      await sendTo(u.id, {
        title: u.locale === 'cs' ? 'Večerní měření' : 'Evening measurement',
        body:
          u.locale === 'cs'
            ? 'Zaznamenej večerní tlak před spaním.'
            : 'Log your evening measurement before bed.',
        url: `/${u.locale}/measurements`,
        tag: 'reminder-evening',
      })
      sent++
    }

    if (u.remindWeightWeekly && isSundayMorning) {
      const last = await db
        .select({ id: weightEntries.id })
        .from(weightEntries)
        .where(and(eq(weightEntries.userId, u.id), gte(weightEntries.measuredAt, since7)))
        .limit(1)
      if (!last[0]) {
        await sendTo(u.id, {
          title: u.locale === 'cs' ? 'Týdenní váha' : 'Weekly weight',
          body: u.locale === 'cs' ? 'Nedělní ráno — čas na váhu.' : 'Sunday morning — time to weigh in.',
          url: `/${u.locale}/weight`,
          tag: 'reminder-weight',
        })
        sent++
      }
    }
  }

  return NextResponse.json({ ok: true, sent })
}

export const GET = run
export const POST = run
