'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Language">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.replace(pathname, { locale: 'en' })}>
          <span className={locale === 'en' ? 'font-semibold' : ''}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.replace(pathname, { locale: 'cs' })}>
          <span className={locale === 'cs' ? 'font-semibold' : ''}>Čeština</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
