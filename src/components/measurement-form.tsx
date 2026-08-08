'use client'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartPulse } from 'lucide-react'
import { createMeasurement } from '@/lib/actions/measurements'

type Ctx = 'rest' | 'after_exertion' | 'morning' | 'evening'
type Arm = 'left' | 'right'

function toLocalIsoNow(): string {
  const d = new Date()
  const tzOffset = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
}

export function MeasurementForm({ onSaved }: { onSaved?: () => void }) {
  const t = useTranslations('measurement')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [pulse, setPulse] = useState('')
  const [measuredAt, setMeasuredAt] = useState(toLocalIsoNow())
  const [arm, setArm] = useState<Arm | ''>('')
  const [context, setContext] = useState<Ctx>('rest')
  const [medsTaken, setMedsTaken] = useState(false)
  const [notes, setNotes] = useState('')
  const [lifestyle, setLifestyle] = useState({
    poorSleep: false,
    stress: false,
    exercise: false,
    alcohol: false,
    coffee: false,
    salt: false,
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const s = Number(systolic)
    const d = Number(diastolic)
    if (!s || !d) return
    startTransition(async () => {
      try {
        await createMeasurement({
          systolic: s,
          diastolic: d,
          pulse: pulse ? Number(pulse) : null,
          measuredAt: new Date(measuredAt).toISOString(),
          arm: arm || null,
          context,
          medsTaken,
          lifestyle,
          notes: notes || null,
        })
        toast.success(t('saved'))
        setSystolic('')
        setDiastolic('')
        setPulse('')
        setNotes('')
        setLifestyle({
          poorSleep: false,
          stress: false,
          exercise: false,
          alcohol: false,
          coffee: false,
          salt: false,
        })
        setMedsTaken(false)
        setMeasuredAt(toLocalIsoNow())
        router.refresh()
        onSaved?.()
      } catch {
        toast.error('Error')
      }
    })
  }

  const lifestyleItems: Array<{ key: keyof typeof lifestyle; label: string }> = [
    { key: 'poorSleep', label: t('lifestylePoorSleep') },
    { key: 'stress', label: t('lifestyleStress') },
    { key: 'exercise', label: t('lifestyleExercise') },
    { key: 'alcohol', label: t('lifestyleAlcohol') },
    { key: 'coffee', label: t('lifestyleCoffee') },
    { key: 'salt', label: t('lifestyleSalt') },
  ]

  const contextItems: Array<{ key: Ctx; label: string }> = [
    { key: 'rest', label: t('contextRest') },
    { key: 'morning', label: t('contextMorning') },
    { key: 'evening', label: t('contextEvening') },
    { key: 'after_exertion', label: t('contextAfterExertion') },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[var(--color-primary)]" /> {t('new')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sys">{t('systolic')}</Label>
              <Input
                id="sys"
                type="number"
                inputMode="numeric"
                min={60}
                max={260}
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                required
                className="text-lg tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dia">{t('diastolic')}</Label>
              <Input
                id="dia"
                type="number"
                inputMode="numeric"
                min={30}
                max={200}
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                required
                className="text-lg tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pulse">{t('pulse')}</Label>
              <Input
                id="pulse"
                type="number"
                inputMode="numeric"
                min={20}
                max={240}
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="text-lg tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="when">{t('measuredAt')}</Label>
            <Input
              id="when"
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('context')}</Label>
            <div className="flex flex-wrap gap-2">
              {contextItems.map((it) => (
                <button
                  type="button"
                  key={it.key}
                  onClick={() => setContext(it.key)}
                  className={
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (context === it.key
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]')
                  }
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('arm')}</Label>
            <div className="flex gap-2">
              {(['left', 'right'] as const).map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setArm(arm === a ? '' : a)}
                  className={
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                    (arm === a
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]')
                  }
                >
                  {a === 'left' ? t('armLeft') : t('armRight')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('lifestyleTitle')}</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {lifestyleItems.map((it) => (
                <label
                  key={it.key}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm cursor-pointer hover:bg-[var(--color-accent)]"
                >
                  <Checkbox
                    checked={lifestyle[it.key]}
                    onCheckedChange={(v) =>
                      setLifestyle((l) => ({ ...l, [it.key]: v === true }))
                    }
                  />
                  {it.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-3 text-sm cursor-pointer hover:bg-[var(--color-accent)]">
            <Checkbox
              checked={medsTaken}
              onCheckedChange={(v) => setMedsTaken(v === true)}
            />
            {t('medsTaken')}
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="flex w-full rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 min-h-[60px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={pending || !systolic || !diastolic}
          >
            {t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
