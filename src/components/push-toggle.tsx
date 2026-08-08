'use client'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { subscribePush, unsubscribePush } from '@/lib/actions/push'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buf = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return buf
}

export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string | null }) {
  const t = useTranslations('settings')
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [pending, start] = useTransition()

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setEnabled(!!sub)
    })
  }, [])

  if (!vapidPublicKey) {
    return (
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Push notifications not configured on server (missing VAPID keys).
      </p>
    )
  }

  async function enable() {
    if (!vapidPublicKey) return
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        toast.error('Permission denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
      const json = sub.toJSON()
      await subscribePush({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! },
      })
      setEnabled(true)
      toast.success(t('notificationsEnabled'))
    } catch (err) {
      toast.error('Failed to enable')
    }
  }

  async function disable() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await unsubscribePush(sub.endpoint)
        await sub.unsubscribe()
      }
      setEnabled(false)
      toast.success('Disabled')
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm">
        {enabled ? t('notificationsEnabled') : t('notificationsDisabled')}
      </div>
      <Button
        onClick={() => start(async () => (enabled ? await disable() : await enable()))}
        variant={enabled ? 'outline' : 'default'}
        disabled={pending}
        size="sm"
      >
        {enabled ? (
          <>
            <BellOff className="h-4 w-4" /> {t('disableNotifications')}
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" /> {t('enableNotifications')}
          </>
        )}
      </Button>
    </div>
  )
}
