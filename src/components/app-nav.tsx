'use client'
import { useTranslations } from 'next-intl'
import { usePathname, Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { LayoutDashboard, HeartPulse, Scale, User, Settings } from 'lucide-react'

export function AppNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/measurements', label: t('measurements'), icon: HeartPulse },
    { href: '/weight', label: t('weight'), icon: Scale },
    { href: '/profile', label: t('profile'), icon: User },
    { href: '/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <>
      {/* Sidebar (md+) */}
      <nav className="hidden md:flex flex-col gap-1 p-4 pt-6 w-56 shrink-0 border-r border-[var(--color-border)]">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/')
          const Icon = it.icon
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/50',
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom bar (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur safe-bottom">
        <div className="grid grid-cols-5">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/')
            const Icon = it.icon
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-[11px] font-medium',
                  active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-muted-foreground)]',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate max-w-full px-1">{it.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
