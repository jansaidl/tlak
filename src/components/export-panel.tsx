'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download } from 'lucide-react'

export function ExportPanel() {
  const t = useTranslations('export')
  const locale = useLocale()
  const [days, setDays] = useState('90')

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-muted-foreground)]">{t('description')}</p>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--color-muted-foreground)]">{t('range')}</label>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">{t('days30')}</SelectItem>
              <SelectItem value="90">{t('days90')}</SelectItem>
              <SelectItem value="180">{t('days180')}</SelectItem>
              <SelectItem value="365">{t('days365')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <a href={`/api/export/pdf?days=${days}&locale=${locale}`} target="_blank" rel="noopener">
            <Download className="h-4 w-4" />
            {t('download')}
          </a>
        </Button>
      </div>
    </div>
  )
}
