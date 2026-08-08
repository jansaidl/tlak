import { NextResponse } from 'next/server'
import { and, eq, gte, desc } from 'drizzle-orm'
import { subDays, format } from 'date-fns'
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { auth } from '@/auth'
import { db } from '@/db'
import { measurements, users } from '@/db/schema'
import { classify } from '@/lib/esh'
import { ageFromBirthDate } from '@/lib/bmi'
import React from 'react'

export const runtime = 'nodejs'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111',
  },
  h1: { fontSize: 20, marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  meta: { fontSize: 10, color: '#555', marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 6,
    borderBottom: '1pt solid #ddd',
    paddingBottom: 3,
  },
  grid: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  card: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f7f7f8',
    border: '1pt solid #eee',
  },
  cardLabel: { fontSize: 8, color: '#666', textTransform: 'uppercase', marginBottom: 3 },
  cardValue: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottom: '0.5pt solid #eee',
  },
  colDate: { width: 110, fontSize: 9 },
  colVal: { width: 70, fontSize: 10, fontFamily: 'Helvetica-Bold' },
  colPulse: { width: 40, fontSize: 9 },
  colCat: { width: 90, fontSize: 9, color: '#555' },
  colNotes: { flex: 1, fontSize: 9, color: '#555' },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottom: '1pt solid #999',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  medBox: {
    padding: 8,
    backgroundColor: '#f7f7f8',
    border: '1pt solid #eee',
    borderRadius: 4,
    fontSize: 10,
  },
})

function avg(nums: number[]) {
  if (!nums.length) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days') ?? 90)))
  const locale = url.searchParams.get('locale') === 'cs' ? 'cs' : 'en'

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const since = subDays(new Date(), days)
  const rows = await db
    .select()
    .from(measurements)
    .where(and(eq(measurements.userId, user.id), gte(measurements.measuredAt, since)))
    .orderBy(desc(measurements.measuredAt))

  const avgS = avg(rows.map((r) => r.systolic))
  const avgD = avg(rows.map((r) => r.diastolic))
  const avgP = avg(rows.map((r) => r.pulse ?? -1).filter((n) => n > 0))

  const strings =
    locale === 'cs'
      ? {
          title: 'Report krevního tlaku',
          patient: 'Pacient',
          period: 'Období',
          generated: 'Vygenerováno',
          summary: 'Souhrn',
          count: 'Počet měření',
          avgSys: 'Průměrná systola',
          avgDia: 'Průměrná diastola',
          avgPulse: 'Průměrný puls',
          medication: 'Medikace',
          measurements: 'Měření',
          date: 'Datum a čas',
          value: 'SYS/DIA',
          pulse: 'Puls',
          category: 'Kategorie',
          notes: 'Poznámka',
          age: 'Věk',
          height: 'Výška',
        }
      : {
          title: 'Blood pressure report',
          patient: 'Patient',
          period: 'Period',
          generated: 'Generated',
          summary: 'Summary',
          count: 'Number of measurements',
          avgSys: 'Average systolic',
          avgDia: 'Average diastolic',
          avgPulse: 'Average pulse',
          medication: 'Medication',
          measurements: 'Measurements',
          date: 'Date & time',
          value: 'SYS/DIA',
          pulse: 'Pulse',
          category: 'Category',
          notes: 'Notes',
          age: 'Age',
          height: 'Height',
        }

  const eshLabels = {
    optimal: locale === 'cs' ? 'Optimální' : 'Optimal',
    normal: locale === 'cs' ? 'Normální' : 'Normal',
    highNormal: locale === 'cs' ? 'Vysoký normál' : 'High-normal',
    grade1: locale === 'cs' ? 'Hypertenze 1' : 'Hypertension 1',
    grade2: locale === 'cs' ? 'Hypertenze 2' : 'Hypertension 2',
    grade3: locale === 'cs' ? 'Hypertenze 3' : 'Hypertension 3',
    isolated: locale === 'cs' ? 'Izolovaná syst.' : 'Isolated syst.',
  }

  const age = ageFromBirthDate(user.birthDate)
  const periodStr = `${format(since, 'PP')} — ${format(new Date(), 'PP')}`

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.h1 }, strings.title),
      React.createElement(
        Text,
        { style: styles.meta },
        `${strings.patient}: ${user.name || user.email}` +
          (age != null ? ` · ${strings.age}: ${age}` : '') +
          (user.heightCm ? ` · ${strings.height}: ${user.heightCm} cm` : '') +
          `\n${strings.period}: ${periodStr}` +
          `\n${strings.generated}: ${format(new Date(), 'PPpp')}`,
      ),

      React.createElement(Text, { style: styles.sectionTitle }, strings.summary),
      React.createElement(
        View,
        { style: styles.grid },
        React.createElement(
          View,
          { style: styles.card },
          React.createElement(Text, { style: styles.cardLabel }, strings.count),
          React.createElement(Text, { style: styles.cardValue }, String(rows.length)),
        ),
        React.createElement(
          View,
          { style: styles.card },
          React.createElement(Text, { style: styles.cardLabel }, strings.avgSys),
          React.createElement(Text, { style: styles.cardValue }, avgS != null ? `${avgS}` : '—'),
        ),
        React.createElement(
          View,
          { style: styles.card },
          React.createElement(Text, { style: styles.cardLabel }, strings.avgDia),
          React.createElement(Text, { style: styles.cardValue }, avgD != null ? `${avgD}` : '—'),
        ),
        React.createElement(
          View,
          { style: styles.card },
          React.createElement(Text, { style: styles.cardLabel }, strings.avgPulse),
          React.createElement(Text, { style: styles.cardValue }, avgP != null ? `${avgP}` : '—'),
        ),
      ),

      user.medication
        ? React.createElement(
            View,
            {},
            React.createElement(Text, { style: styles.sectionTitle }, strings.medication),
            React.createElement(View, { style: styles.medBox }, React.createElement(Text, {}, user.medication)),
          )
        : null,

      React.createElement(Text, { style: styles.sectionTitle }, strings.measurements),
      React.createElement(
        View,
        { style: styles.headerRow },
        React.createElement(Text, { style: styles.colDate }, strings.date),
        React.createElement(Text, { style: styles.colVal }, strings.value),
        React.createElement(Text, { style: styles.colPulse }, strings.pulse),
        React.createElement(Text, { style: styles.colCat }, strings.category),
        React.createElement(Text, { style: styles.colNotes }, strings.notes),
      ),
      ...rows.map((r) =>
        React.createElement(
          View,
          { style: styles.row, key: String(r.id) },
          React.createElement(Text, { style: styles.colDate }, format(r.measuredAt, 'PP p')),
          React.createElement(Text, { style: styles.colVal }, `${r.systolic}/${r.diastolic}`),
          React.createElement(Text, { style: styles.colPulse }, r.pulse != null ? String(r.pulse) : '—'),
          React.createElement(Text, { style: styles.colCat }, eshLabels[classify(r.systolic, r.diastolic)]),
          React.createElement(Text, { style: styles.colNotes }, r.notes ?? ''),
        ),
      ),
    ),
  )

  const stream = await pdf(doc as any).toBuffer()
  return new NextResponse(stream as any, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="tlak-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      'cache-control': 'no-store',
    },
  })
}
