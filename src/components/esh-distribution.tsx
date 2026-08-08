'use client'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { classify, ESH_BANDS, type EshCategory } from '@/lib/esh'

export function EshDistribution({
  measurements,
  labels,
}: {
  measurements: Array<{ systolic: number; diastolic: number }>
  labels: Record<EshCategory, string>
}) {
  const counts: Record<EshCategory, number> = {
    optimal: 0,
    normal: 0,
    highNormal: 0,
    grade1: 0,
    grade2: 0,
    grade3: 0,
    isolated: 0,
  }
  for (const m of measurements) counts[classify(m.systolic, m.diastolic)]++
  const data = (Object.keys(counts) as EshCategory[])
    .filter((k) => counts[k] > 0)
    .map((k) => ({ name: labels[k], key: k, value: counts[k], color: ESH_BANDS[k].color }))

  if (data.length === 0) return null

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
