'use client'
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { OPTIMAL_TARGET } from '@/lib/esh'

export interface BpPoint {
  ts: number
  systolic: number
  diastolic: number
  pulse: number | null
}

export function BpChart({
  data,
  labels,
  compact = false,
}: {
  data: BpPoint[]
  labels: { systolic: string; diastolic: string; pulse: string; target: string }
  compact?: boolean
}) {
  const rows = useMemo(
    () =>
      data
        .slice()
        .sort((a, b) => a.ts - b.ts)
        .map((p) => ({
          ts: p.ts,
          systolic: p.systolic,
          diastolic: p.diastolic,
          pulse: p.pulse ?? undefined,
        })),
    [data],
  )

  return (
    <div className={compact ? 'h-48 sm:h-56' : 'h-56 sm:h-72 md:h-96'}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="diaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) => format(new Date(v), 'MMM d')}
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={[40, (dataMax: number) => Math.max(180, Math.ceil(dataMax / 10) * 10)]}
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
            width={30}
          />
          <ReferenceArea
            y1={OPTIMAL_TARGET.diastolicMin}
            y2={OPTIMAL_TARGET.systolicMax}
            fill="#10b981"
            fillOpacity={0.05}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(v: number) => format(new Date(v), 'PPp')}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="systolic"
            name={labels.systolic}
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#sysGrad)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="diastolic"
            name={labels.diastolic}
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#diaGrad)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pulse"
            name={labels.pulse}
            stroke="#a855f7"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
