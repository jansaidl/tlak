export type EshCategory =
  | 'optimal'
  | 'normal'
  | 'highNormal'
  | 'grade1'
  | 'grade2'
  | 'grade3'
  | 'isolated'

export interface EshBand {
  key: EshCategory
  color: string
  bgClass: string
  textClass: string
  ringClass: string
}

// ESH 2023 guidelines — office blood pressure classification.
export const ESH_BANDS: Record<EshCategory, EshBand> = {
  optimal: {
    key: 'optimal',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    ringClass: 'ring-emerald-500/30',
  },
  normal: {
    key: 'normal',
    color: '#22c55e',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-600 dark:text-green-400',
    ringClass: 'ring-green-500/30',
  },
  highNormal: {
    key: 'highNormal',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-600 dark:text-yellow-400',
    ringClass: 'ring-yellow-500/30',
  },
  grade1: {
    key: 'grade1',
    color: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    ringClass: 'ring-orange-500/30',
  },
  grade2: {
    key: 'grade2',
    color: '#ef4444',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
    ringClass: 'ring-red-500/30',
  },
  grade3: {
    key: 'grade3',
    color: '#b91c1c',
    bgClass: 'bg-red-700/15',
    textClass: 'text-red-700 dark:text-red-300',
    ringClass: 'ring-red-700/40',
  },
  isolated: {
    key: 'isolated',
    color: '#a855f7',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    ringClass: 'ring-purple-500/30',
  },
}

export function classify(systolic: number, diastolic: number): EshCategory {
  if (systolic >= 140 && diastolic < 90) return 'isolated'
  if (systolic >= 180 || diastolic >= 110) return 'grade3'
  if (systolic >= 160 || diastolic >= 100) return 'grade2'
  if (systolic >= 140 || diastolic >= 90) return 'grade1'
  if (systolic >= 130 || diastolic >= 85) return 'highNormal'
  if (systolic >= 120 || diastolic >= 80) return 'normal'
  return 'optimal'
}

export const OPTIMAL_TARGET = {
  systolicMin: 110,
  systolicMax: 129,
  diastolicMin: 70,
  diastolicMax: 84,
}
