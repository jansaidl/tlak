'use client'
import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { startAuthentication } from '@simplewebauthn/browser'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Fingerprint } from 'lucide-react'
import { useRouter } from '@/i18n/routing'

export function LoginForm({
  messages,
}: {
  messages: {
    signInWithPasskey: string
    invalidCredentials: string
    passkeyExplainer: string
  }
}) {
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setBusy(true)
    try {
      const res = await fetch('/api/webauthn/login/options', { method: 'POST' })
      if (!res.ok) throw new Error('options')
      const { options, challengeId } = await res.json()
      const assertion = await startAuthentication(options)
      const result = await signIn('webauthn-login', {
        redirect: false,
        challengeId,
        response: JSON.stringify(assertion),
      })
      if (result?.error) {
        toast.error(messages.invalidCredentials)
        return
      }
      startTransition(() => router.push('/dashboard'))
    } catch (err) {
      toast.error(messages.invalidCredentials)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleLogin}
        className="w-full"
        size="lg"
        disabled={busy || pending}
      >
        <Fingerprint className="h-4 w-4" />
        {messages.signInWithPasskey}
      </Button>
      <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
        {messages.passkeyExplainer}
      </p>
    </div>
  )
}
