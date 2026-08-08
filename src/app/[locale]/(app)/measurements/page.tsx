import { getTranslations, setRequestLocale } from 'next-intl/server'
import { desc, eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { enUS, cs as csLoc } from 'date-fns/locale'
import { requireUser } from '@/lib/session'
import { db } from '@/db'
import { measurements } from '@/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MeasurementForm } from '@/components/measurement-form'
import { EshBadge } from '@/components/esh-badge'
import { DeleteMeasurementButton } from './delete-button'

export default async function MeasurementsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await requireUser(locale)
  const t = await getTranslations('measurement')
  const tEsh = await getTranslations('esh')

  const rows = await db
    .select()
    .from(measurements)
    .where(eq(measurements.userId, user.id))
    .orderBy(desc(measurements.measuredAt))
    .limit(200)

  const eshLabels = {
    optimal: tEsh('optimal'),
    normal: tEsh('normal'),
    highNormal: tEsh('highNormal'),
    grade1: tEsh('grade1'),
    grade2: tEsh('grade2'),
    grade3: tEsh('grade3'),
    isolated: tEsh('isolated'),
  }

  const dLoc = locale === 'cs' ? csLoc : enUS

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="space-y-4">
        <MeasurementForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] py-16 text-center">
              {t('empty')}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {rows.map((m) => (
                <li key={m.id} className="p-3 sm:p-4 flex items-start gap-3">
                  <div className="min-w-[64px] sm:min-w-[68px]">
                    <div className="text-lg font-semibold tabular-nums leading-tight">
                      {m.systolic}
                      <span className="text-[var(--color-muted-foreground)] font-normal">/</span>
                      {m.diastolic}
                    </div>
                    {m.pulse ? (
                      <div className="text-xs text-[var(--color-muted-foreground)] tabular-nums">
                        {m.pulse} {t('bpm')}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <EshBadge systolic={m.systolic} diastolic={m.diastolic} labels={eshLabels} />
                      {m.context && (
                        <span className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)]">
                          · {m.context === 'rest' ? t('contextRest') : m.context === 'after_exertion' ? t('contextAfterExertion') : m.context === 'morning' ? t('contextMorning') : t('contextEvening')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-1 tabular-nums truncate">
                      {format(m.measuredAt, 'PPp', { locale: dLoc })}
                    </div>
                    {m.notes && (
                      <div className="mt-1 text-sm text-[var(--color-muted-foreground)] line-clamp-2 break-words">
                        {m.notes}
                      </div>
                    )}
                  </div>
                  <DeleteMeasurementButton id={m.id} confirmText={t('deleteConfirm')} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
