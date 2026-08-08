'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { updateProfile } from '@/lib/actions/profile'
import { useRouter } from '@/i18n/routing'

export function LocaleSaveSwitcher({ currentLocale }: { currentLocale: 'en' | 'cs' }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function pick(locale: 'en' | 'cs') {
    start(async () => {
      try {
        await updateProfile({ locale })
        toast.success('Saved')
        router.replace('/settings', { locale })
      } catch {
        toast.error('Error')
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={currentLocale === 'en' ? 'default' : 'outline'}
        onClick={() => pick('en')}
        disabled={pending}
      >
        English
      </Button>
      <Button
        variant={currentLocale === 'cs' ? 'default' : 'outline'}
        onClick={() => pick('cs')}
        disabled={pending}
      >
        Čeština
      </Button>
    </div>
  )
}
