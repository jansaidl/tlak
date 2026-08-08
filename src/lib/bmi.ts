export function bmi(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm) return null
  const h = heightCm / 100
  if (h <= 0) return null
  return Math.round((weightKg / (h * h)) * 10) / 10
}

export function ageFromBirthDate(birthDate: Date | string | null): number | null {
  if (!birthDate) return null
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}
