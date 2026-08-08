import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/session'
import { PushToggle } from '@/components/push-toggle'
import { ExportPanel } from '@/components/export-panel'
import { LocaleSaveSwitcher } from './locale-switch'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireUser(locale)
  const t = await getTranslations('settings')
  const tExport = await getTranslations('export')

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? null

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LocaleSaveSwitcher currentLocale={locale as 'en' | 'cs'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notifications')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PushToggle vapidPublicKey={vapidPublicKey} />
          <p className="text-xs text-[var(--color-muted-foreground)]">{t('installHint')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tExport('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportPanel />
        </CardContent>
      </Card>
    </div>
  )
}
