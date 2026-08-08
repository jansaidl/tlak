import { getTranslations, setRequestLocale } from 'next-intl/server'
import { desc, eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { enUS, cs as csLoc } from 'date-fns/locale'
import { requireUser } from '@/lib/session'
import { db } from '@/db'
import { weightEntries } from '@/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeightForm } from './weight-form'
import { DeleteWeightButton } from './delete-button'
import { bmi } from '@/lib/bmi'
import { Badge } from '@/components/ui/badge'

export default async function WeightPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await requireUser(locale)
  const t = await getTranslations('weight')

  const rows = await db
    .select()
    .from(weightEntries)
    .where(eq(weightEntries.userId, user.id))
    .orderBy(desc(weightEntries.measuredAt))
    .limit(200)

  const dLoc = locale === 'cs' ? csLoc : enUS

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="space-y-4">
        <WeightForm />
        <Card>
          <CardContent className="p-4 text-sm text-[var(--color-muted-foreground)]">
            {t('weeklyReminder')}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] py-12 text-center">
              {t('empty')}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {rows.map((w) => {
                const kg = w.weightKgX10 / 10
                const b = user.heightCm ? bmi(kg, user.heightCm) : null
                return (
                  <li key={w.id} className="p-4 flex items-center gap-3">
                    <div className="text-lg font-semibold tabular-nums w-24">
                      {kg.toFixed(1)} <span className="text-sm text-[var(--color-muted-foreground)] font-normal">{t('kg')}</span>
                    </div>
                    <div className="flex-1 text-xs text-[var(--color-muted-foreground)] tabular-nums">
                      {format(w.measuredAt, 'PP', { locale: dLoc })}
                    </div>
                    {b != null && (
                      <Badge variant="secondary" className="tabular-nums">
                        BMI {b}
                      </Badge>
                    )}
                    <DeleteWeightButton id={w.id} />
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
