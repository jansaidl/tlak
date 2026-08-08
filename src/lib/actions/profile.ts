'use server'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { users } from '@/db/schema'

const schema = z.object({
  name: z.string().max(80).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  sex: z.enum(['male', 'female', 'other']).optional().nullable(),
  heightCm: z.number().int().min(80).max(260).optional().nullable(),
  medication: z.string().max(2000).optional().nullable(),
  locale: z.enum(['en', 'cs']).optional(),
  timezone: z.string().max(80).optional(),
  remindMorning: z.boolean().optional(),
  remindEvening: z.boolean().optional(),
  remindWeightWeekly: z.boolean().optional(),
})

export async function updateProfile(input: unknown) {
  console.log('[updateProfile] input:', JSON.stringify(input))
  const session = await auth()
  if (!session?.user?.id) {
    console.error('[updateProfile] unauthorized — no session')
    throw new Error('unauthorized')
  }
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    console.error('[updateProfile] validation failed:', JSON.stringify(parsed.error.flatten()))
    throw new Error('validation_failed: ' + parsed.error.message)
  }
  const data = parsed.data

  const result = await db
    .update(users)
    .set({
      name: data.name ?? null,
      birthDate: data.birthDate ? data.birthDate : null,
      sex: data.sex ?? null,
      heightCm: data.heightCm ?? null,
      medication: data.medication ?? null,
      ...(data.locale ? { locale: data.locale } : {}),
      ...(data.timezone ? { timezone: data.timezone } : {}),
      ...(typeof data.remindMorning === 'boolean' ? { remindMorning: data.remindMorning } : {}),
      ...(typeof data.remindEvening === 'boolean' ? { remindEvening: data.remindEvening } : {}),
      ...(typeof data.remindWeightWeekly === 'boolean'
        ? { remindWeightWeekly: data.remindWeightWeekly }
        : {}),
    })
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id, name: users.name, birthDate: users.birthDate })

  console.log('[updateProfile] db updated:', JSON.stringify(result))
  revalidatePath('/', 'layout')
  revalidatePath(`/en/profile`)
  revalidatePath(`/cs/profile`)
}
