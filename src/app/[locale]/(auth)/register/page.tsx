import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RegisterForm } from './register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'

export default async function RegisterPage({
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
        <CardTitle className="text-2xl">{t('signUpTitle')}</CardTitle>
        <CardDescription>{t('signUpSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RegisterForm
          messages={{
            email: t('email'),
            emailPlaceholder: t('emailPlaceholder'),
            displayName: t('displayName'),
            namePlaceholder: t('namePlaceholder'),
            createAccount: t('createAccount'),
            registrationFailed: t('registrationFailed'),
            registrationSuccess: t('registrationSuccess'),
            emailInUse: t('emailInUse'),
            passkeyExplainer: t('passkeyExplainer'),
          }}
        />
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          {t('haveAccount')}{' '}
          <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
