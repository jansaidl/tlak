import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LoginForm } from './login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('auth')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t('signInTitle')}</CardTitle>
        <CardDescription>{t('signInSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LoginForm
          messages={{
            signInWithPasskey: t('signInWithPasskey'),
            invalidCredentials: t('invalidCredentials'),
            passkeyExplainer: t('passkeyExplainer'),
          }}
        />
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-[var(--color-primary)] hover:underline">
            {t('signUp')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
