import { auth } from '@/auth'
import { redirect } from '@/i18n/routing'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function requireUser(locale: string) {
  const session = await auth()
  if (!session?.user?.id) redirect({ href: '/login', locale })
  const rows = await db.select().from(users).where(eq(users.id, session!.user.id)).limit(1)
  const user = rows[0]
  if (!user) redirect({ href: '/login', locale })
  return user!
}
