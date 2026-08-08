'use server'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'
import { measurements } from '@/db/schema'

const lifestyleSchema = z
  .object({
    poorSleep: z.boolean().optional(),
    stress: z.boolean().optional(),
    exercise: z.boolean().optional(),
    alcohol: z.boolean().optional(),
    coffee: z.boolean().optional(),
    salt: z.boolean().optional(),
  })
  .optional()

const createSchema = z.object({
  systolic: z.number().int().min(60).max(260),
  diastolic: z.number().int().min(30).max(200),
  pulse: z.number().int().min(20).max(240).optional().nullable(),
  measuredAt: z.string().datetime().or(z.string().transform((s) => new Date(s).toISOString())),
  arm: z.enum(['left', 'right']).optional().nullable(),
  context: z.enum(['rest', 'after_exertion', 'morning', 'evening']).optional().nullable(),
  medsTaken: z.boolean().optional().default(false),
  lifestyle: lifestyleSchema.nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export async function createMeasurement(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  const data = createSchema.parse(input)

  await db.insert(measurements).values({
    userId: session.user.id,
    systolic: data.systolic,
    diastolic: data.diastolic,
    pulse: data.pulse ?? null,
    measuredAt: new Date(data.measuredAt),
    arm: data.arm ?? null,
    context: data.context ?? null,
    medsTaken: data.medsTaken ?? false,
    lifestyle: data.lifestyle ?? null,
    notes: data.notes ?? null,
  })

  revalidatePath('/', 'layout')
}

export async function deleteMeasurement(id: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  await db
    .delete(measurements)
    .where(and(eq(measurements.id, id), eq(measurements.userId, session.user.id)))
  revalidatePath('/', 'layout')
}
