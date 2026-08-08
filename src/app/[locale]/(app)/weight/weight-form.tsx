'use client'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale } from 'lucide-react'
import { createWeightEntry } from '@/lib/actions/weight'

function toLocalIsoNow(): string {
  const d = new Date()
  const off = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

export function WeightForm() {
  const t = useTranslations('weight')
  const [pending, start] = useTransition()
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [measuredAt, setMeasuredAt] = useState(toLocalIsoNow())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[var(--color-primary)]" /> {t('new')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const kg = Number(weight)
            if (!kg) return
            start(async () => {
              try {
                await createWeightEntry({
                  weightKg: kg,
                  measuredAt: new Date(measuredAt).toISOString(),
                })
                toast.success(t('saved'))
                setWeight('')
                router.refresh()
              } catch {
                toast.error('Error')
              }
            })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="w">
              {t('title')} ({t('kg')})
            </Label>
            <Input
              id="w"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="text-lg tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wd">When</Label>
            <Input
              id="wd"
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending || !weight}>
            {t('new')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
