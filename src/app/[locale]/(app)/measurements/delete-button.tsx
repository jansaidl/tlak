'use client'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/routing'
import { deleteMeasurement } from '@/lib/actions/measurements'

export function DeleteMeasurementButton({ id, confirmText }: { id: number; confirmText: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return
        start(async () => {
          await deleteMeasurement(id)
          router.refresh()
        })
      }}
      aria-label="Delete"
      className="text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)]"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
