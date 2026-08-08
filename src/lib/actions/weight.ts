'use server'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { weightEntries } from '@/db/schema'

const schema = z.object({
  weightKg: z.number().min(20).max(400),
  measuredAt: z.string(),
})

export async function createWeightEntry(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  const data = schema.parse(input)
  await db.insert(weightEntries).values({
    userId: session.user.id,
    weightKgX10: Math.round(data.weightKg * 10),
    measuredAt: new Date(data.measuredAt),
  })
  revalidatePath('/', 'layout')
}

export async function deleteWeightEntry(id: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  await db
    .delete(weightEntries)
    .where(and(eq(weightEntries.id, id), eq(weightEntries.userId, session.user.id)))
  revalidatePath('/', 'layout')
}
