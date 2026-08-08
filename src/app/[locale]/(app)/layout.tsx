import { setRequestLocale } from 'next-intl/server'
import { HeartPulse } from 'lucide-react'

export const dynamic = 'force-dynamic'
import { Link } from '@/i18n/routing'
import { AppNav } from '@/components/app-nav'
import { UserMenu } from '@/components/user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { requireUser } from '@/lib/session'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await requireUser(locale)

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur sticky top-0 z-30">
        <div className="container-app flex items-center justify-between py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <HeartPulse className="h-5 w-5 text-[var(--color-primary)]" />
            Tlak
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu email={user.email} name={user.name} />
          </div>
        </div>
      </header>
      <div className="flex-1 flex">
        <AppNav />
        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          <div className="container-app py-4 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
