import { classify, ESH_BANDS, type EshCategory } from '@/lib/esh'
import { cn } from '@/lib/utils'

const KEY_TO_LABEL: Record<EshCategory, string> = {
  optimal: 'optimal',
  normal: 'normal',
  highNormal: 'highNormal',
  grade1: 'grade1',
  grade2: 'grade2',
  grade3: 'grade3',
  isolated: 'isolated',
}

export function EshBadge({
  systolic,
  diastolic,
  labels,
  className,
}: {
  systolic: number
  diastolic: number
  labels: Record<EshCategory, string>
  className?: string
}) {
  const cat = classify(systolic, diastolic)
  const band = ESH_BANDS[cat]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        band.bgClass,
        band.textClass,
        band.ringClass,
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: band.color }}
      />
      {labels[cat] ?? KEY_TO_LABEL[cat]}
    </span>
  )
}
