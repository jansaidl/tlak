'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'tlak-guidance-dismissed'

export function GuidanceCard() {
  const t = useTranslations('guidance')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = window.localStorage.getItem(STORAGE_KEY)
    setVisible(dismissed !== '1')
  }, [])

  if (!visible) return null

  const tips = ['tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tip6'] as const

  return (
    <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/[0.03]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
            <Info className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{t('title')}</h3>
              <button
                onClick={() => {
                  window.localStorage.setItem(STORAGE_KEY, '1')
                  setVisible(false)
                }}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted-foreground)]">
              {tips.map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--color-primary)] shrink-0" />
                  {t(k)}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.localStorage.setItem(STORAGE_KEY, '1')
                  setVisible(false)
                }}
              >
                {t('gotIt')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
