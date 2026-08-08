import { setRequestLocale } from 'next-intl/server'
import { HeartPulse } from 'lucide-react'

export const dynamic = 'force-dynamic'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Link } from '@/i18n/routing'
import { auth } from '@/auth'
import { redirect } from '@/i18n/routing'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await auth()
  if (session?.user?.id) redirect({ href: '/dashboard', locale })

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr]">
      <header className="container-app flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <HeartPulse className="h-5 w-5 text-[var(--color-primary)]" />
          Tlak
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="container-app flex items-center justify-center pb-16 pt-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
