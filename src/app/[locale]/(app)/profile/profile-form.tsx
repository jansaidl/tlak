'use client'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile } from '@/lib/actions/profile'

type Sex = 'male' | 'female' | 'other'

export function ProfileForm({
  initial,
}: {
  initial: {
    name: string
    birthDate: string
    sex: Sex | null
    heightCm: number | null
    medication: string
    timezone: string
    remindMorning: boolean
    remindEvening: boolean
    remindWeightWeekly: boolean
  }
}) {
  const t = useTranslations('profile')
  const [pending, start] = useTransition()
  const router = useRouter()
  const [form, setForm] = useState(initial)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          try {
            await updateProfile({
              name: form.name || null,
              birthDate: form.birthDate || null,
              sex: form.sex ?? null,
              heightCm: form.heightCm ?? null,
              medication: form.medication || null,
              timezone: form.timezone,
              remindMorning: form.remindMorning,
              remindEvening: form.remindEvening,
              remindWeightWeekly: form.remindWeightWeekly,
            })
            toast.success(t('saved'))
            router.refresh()
          } catch {
            toast.error('Error')
          }
        })
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dname">{t('displayName')}</Label>
              <Input
                id="dname"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">{t('birthDate')}</Label>
              <Input
                id="dob"
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('sex')}</Label>
              <Select
                value={form.sex ?? undefined}
                onValueChange={(v) => setForm({ ...form, sex: v as Sex })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('sexMale')}</SelectItem>
                  <SelectItem value="female">{t('sexFemale')}</SelectItem>
                  <SelectItem value="other">{t('sexOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="h">
                {t('height')} ({t('cm')})
              </Label>
              <Input
                id="h"
                type="number"
                inputMode="numeric"
                value={form.heightCm ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    heightCm: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tz">{t('timezone')}</Label>
              <Input
                id="tz"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med">{t('medication')}</Label>
            <textarea
              id="med"
              rows={3}
              value={form.medication}
              onChange={(e) => setForm({ ...form, medication: e.target.value })}
              placeholder={t('medicationPlaceholder')}
              className="flex w-full rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] min-h-[70px]"
            />
            <p className="text-xs text-[var(--color-muted-foreground)]">{t('medicationHelp')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchRow
            label={t('morningReminder')}
            checked={form.remindMorning}
            onChange={(v) => setForm({ ...form, remindMorning: v })}
          />
          <SwitchRow
            label={t('eveningReminder')}
            checked={form.remindEvening}
            onChange={(v) => setForm({ ...form, remindEvening: v })}
          />
          <SwitchRow
            label={t('weightReminder')}
            checked={form.remindWeightWeekly}
            onChange={(v) => setForm({ ...form, remindWeightWeekly: v })}
          />
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={pending} size="lg">
          {t('save')}
        </Button>
      </div>
    </form>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
