import { getTranslations, setRequestLocale } from 'next-intl/server'
import { and, desc, eq, gte } from 'drizzle-orm'
import { subDays } from 'date-fns'
import { requireUser } from '@/lib/session'
import { db } from '@/db'
import { measurements } from '@/db/schema'
import { classify, ESH_BANDS } from '@/lib/esh'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BpChart } from '@/components/bp-chart'
import { EshDistribution } from '@/components/esh-distribution'
import { EshBadge } from '@/components/esh-badge'
import { GuidanceCard } from '@/components/guidance-card'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { HeartPulse, TrendingUp, Calendar, Sparkles, Plus } from 'lucide-react'
import { formatDistanceToNowStrict } from 'date-fns'
import { enUS, cs as csLoc } from 'date-fns/locale'

function avg<T>(items: T[], get: (t: T) => number | null | undefined): number | null {
  const nums = items.map(get).filter((v): v is number => typeof v === 'number')
  if (!nums.length) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function startOfLocalDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

export default async function Dashboard({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await requireUser(locale)
  const t = await getTranslations('dashboard')
  const tEsh = await getTranslations('esh')
  const tMeas = await getTranslations('measurement')

  const now = new Date()
  const since90 = subDays(now, 90)
  const rows = await db
    .select()
    .from(measurements)
    .where(and(eq(measurements.userId, user.id), gte(measurements.measuredAt, since90)))
    .orderBy(desc(measurements.measuredAt))

  const today = rows.filter(
    (r) => r.measuredAt.getTime() >= startOfLocalDay(now).getTime(),
  )
  const last7 = rows.filter((r) => r.measuredAt.getTime() >= subDays(now, 7).getTime())
  const last30 = rows.filter((r) => r.measuredAt.getTime() >= subDays(now, 30).getTime())

  const todayAvgSys = avg(today, (r) => r.systolic)
  const todayAvgDia = avg(today, (r) => r.diastolic)
  const week = { s: avg(last7, (r) => r.systolic), d: avg(last7, (r) => r.diastolic) }
  const month = { s: avg(last30, (r) => r.systolic), d: avg(last30, (r) => r.diastolic) }

  const chartData = last30
    .slice()
    .reverse()
    .map((r) => ({
      ts: r.measuredAt.getTime(),
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
    }))

  // Streak: consecutive days with at least 1 measurement, going back from today.
  const dayHas = new Set<string>()
  for (const r of rows) dayHas.add(startOfLocalDay(r.measuredAt).toDateString())
  let streak = 0
  for (let i = 0; ; i++) {
    const d = startOfLocalDay(subDays(now, i))
    if (dayHas.has(d.toDateString())) streak++
    else break
  }
  // Compliance last 30d: (days with morning+evening) / 30
  const morningDays = new Set<string>()
  const eveningDays = new Set<string>()
  for (const r of last30) {
    const key = startOfLocalDay(r.measuredAt).toDateString()
    const hr = r.measuredAt.getHours()
    if (hr < 12) morningDays.add(key)
    else eveningDays.add(key)
  }
  const complianceDays = Array.from(morningDays).filter((k) => eveningDays.has(k)).length
  const compliance = Math.round((complianceDays / 30) * 100)

  const eshLabels = {
    optimal: tEsh('optimal'),
    normal: tEsh('normal'),
    highNormal: tEsh('highNormal'),
    grade1: tEsh('grade1'),
    grade2: tEsh('grade2'),
    grade3: tEsh('grade3'),
    isolated: tEsh('isolated'),
  }

  const last = rows[0]
  const lastAgo = last
    ? formatDistanceToNowStrict(last.measuredAt, {
        addSuffix: true,
        locale: locale === 'cs' ? csLoc : enUS,
      })
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {t('welcome', { name: user.name || user.email.split('@')[0] })}
          </h1>
          {last && (
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              {t('lastMeasurement')}:{' '}
              <span className="tabular-nums">
                {last.systolic}/{last.diastolic}
              </span>{' '}
              · {lastAgo}
            </p>
          )}
        </div>
        <Button asChild size="lg">
          <Link href="/measurements">
            <Plus className="h-4 w-4" />
            {tMeas('new')}
          </Link>
        </Button>
      </div>

      <GuidanceCard />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<HeartPulse className="h-4 w-4" />}
          label={t('todayAvg')}
          value={todayAvgSys && todayAvgDia ? `${todayAvgSys}/${todayAvgDia}` : '—'}
          sub={
            todayAvgSys && todayAvgDia ? (
              <EshBadge systolic={todayAvgSys} diastolic={todayAvgDia} labels={eshLabels} />
            ) : null
          }
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label={t('weekAvg')}
          value={week.s && week.d ? `${week.s}/${week.d}` : '—'}
          sub={
            week.s && week.d ? (
              <EshBadge systolic={week.s} diastolic={week.d} labels={eshLabels} />
            ) : null
          }
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label={t('monthAvg')}
          value={month.s && month.d ? `${month.s}/${month.d}` : '—'}
          sub={
            month.s && month.d ? (
              <EshBadge systolic={month.s} diastolic={month.d} labels={eshLabels} />
            ) : null
          }
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label={t('streak')}
          value={String(streak)}
          sub={
            <div className="text-xs text-[var(--color-muted-foreground)]">
              {t('streakDays', { count: streak })} · {t('compliance')}: {compliance}%
            </div>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length ? (
            <BpChart
              data={chartData}
              labels={{
                systolic: tMeas('systolic'),
                diastolic: tMeas('diastolic'),
                pulse: tMeas('pulse'),
                target: t('chartTargetBand'),
              }}
            />
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)] py-12 text-center">
              {t('noData')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {last30.length ? (
              <>
                <EshDistribution measurements={last30} labels={eshLabels} />
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {(
                    ['optimal', 'normal', 'highNormal', 'grade1', 'grade2', 'grade3', 'isolated'] as const
                  ).map((k) => {
                    const c = last30.filter((r) => classify(r.systolic, r.diastolic) === k).length
                    if (!c) return null
                    return (
                      <div key={k} className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: ESH_BANDS[k].color }}
                        />
                        <span className="text-[var(--color-muted-foreground)] flex-1">{eshLabels[k]}</span>
                        <span className="font-medium tabular-nums">{c}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)] py-12 text-center">
                {t('noData')}
              </p>
            )}
          </CardContent>
        </Card>

        <MorningVsEveningCard rows={last30} title={t('morningVsEvening')} noData={t('noData')} />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between text-[var(--color-muted-foreground)] text-[10px] sm:text-xs uppercase tracking-wider gap-2">
          <span className="truncate">{label}</span>
          <span className="shrink-0">{icon}</span>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-semibold tabular-nums">{value}</div>
        <div className="mt-2">{sub}</div>
      </CardContent>
    </Card>
  )
}

function MorningVsEveningCard({
  rows,
  title,
  noData,
}: {
  rows: Array<{ systolic: number; diastolic: number; measuredAt: Date }>
  title: string
  noData: string
}) {
  const morning = rows.filter((r) => r.measuredAt.getHours() < 12)
  const evening = rows.filter((r) => r.measuredAt.getHours() >= 12)
  const mAvgS = avg(morning, (r) => r.systolic)
  const mAvgD = avg(morning, (r) => r.diastolic)
  const eAvgS = avg(evening, (r) => r.systolic)
  const eAvgD = avg(evening, (r) => r.diastolic)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Morning
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {mAvgS && mAvgD ? `${mAvgS}/${mAvgD}` : '—'}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                n = {morning.length}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Evening
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {eAvgS && eAvgD ? `${eAvgS}/${eAvgD}` : '—'}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                n = {evening.length}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted-foreground)] py-12 text-center">{noData}</p>
        )}
      </CardContent>
    </Card>
  )
}
