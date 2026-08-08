import { getTranslations, setRequestLocale } from 'next-intl/server'
import { requireUser } from '@/lib/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from './profile-form'
import { ageFromBirthDate, bmi } from '@/lib/bmi'
import { db } from '@/db'
import { weightEntries } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await requireUser(locale)
  const t = await getTranslations('profile')

  const latestWeightRow = await db
    .select()
    .from(weightEntries)
    .where(eq(weightEntries.userId, user.id))
    .orderBy(desc(weightEntries.measuredAt))
    .limit(1)
  const latestWeight = latestWeightRow[0] ? latestWeightRow[0].weightKgX10 / 10 : null
  const age = ageFromBirthDate(user.birthDate)
  const currentBmi = latestWeight && user.heightCm ? bmi(latestWeight, user.heightCm) : null

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ProfileForm
        initial={{
          name: user.name ?? '',
          birthDate: user.birthDate ?? '',
          sex: (user.sex as 'male' | 'female' | 'other' | null) ?? null,
          heightCm: user.heightCm,
          medication: user.medication ?? '',
          timezone: user.timezone,
          remindMorning: user.remindMorning,
          remindEvening: user.remindEvening,
          remindWeightWeekly: user.remindWeightWeekly,
        }}
      />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label={t('computed.age')} value={age != null ? `${age} ${t('computed.years')}` : '—'} />
            <Row label={t('height')} value={user.heightCm ? `${user.heightCm} ${t('cm')}` : '—'} />
            <Row label="Weight" value={latestWeight ? `${latestWeight} kg` : '—'} />
            <Row label={t('computed.bmi')} value={currentBmi != null ? String(currentBmi) : '—'} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-muted-foreground)]">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
