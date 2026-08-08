import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { HeartPulse, ShieldCheck, LineChart } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { auth } from '@/auth'
import { redirect } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

export default async function Landing({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await auth()
  if (session?.user?.id) redirect({ href: '/dashboard', locale })

  const t = await getTranslations('landing')
  const tCommon = await getTranslations('common')

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="container-app flex items-center justify-between py-4">
        <div className="flex items-center gap-2 font-semibold">
          <HeartPulse className="h-5 w-5 text-[var(--color-primary)]" />
          Tlak
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="container-app flex-1 flex flex-col justify-center py-8 sm:py-16 max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          {t('hero')}
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[var(--color-muted-foreground)] max-w-xl">
          {t('sub')}
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/register">{t('getStarted')}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/login">{t('already')}</Link>
          </Button>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-5 sm:grid-cols-3 text-sm">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Passkey only</div>
              <div className="text-[var(--color-muted-foreground)]">
                Face ID, fingerprint, Windows Hello. No passwords.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <LineChart className="h-5 w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Trend-first</div>
              <div className="text-[var(--color-muted-foreground)]">
                Charts and ESH categories, not just numbers.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <HeartPulse className="h-5 w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Doctor-ready</div>
              <div className="text-[var(--color-muted-foreground)]">
                One-click PDF export for your next visit.
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container-app py-6 text-xs text-[var(--color-muted-foreground)]">
        {tCommon('learnMore')}
      </footer>
    </div>
  )
}
