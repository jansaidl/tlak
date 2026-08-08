'use client'
import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { startRegistration } from '@simplewebauthn/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Fingerprint } from 'lucide-react'
import { useRouter } from '@/i18n/routing'

export function RegisterForm({
  messages,
}: {
  messages: {
    email: string
    emailPlaceholder: string
    displayName: string
    namePlaceholder: string
    createAccount: string
    registrationFailed: string
    registrationSuccess: string
    emailInUse: string
    passkeyExplainer: string
  }
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    try {
      const res = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      if (res.status === 409) {
        toast.error(messages.emailInUse)
        return
      }
      if (!res.ok) throw new Error('options')
      const { options, challengeId } = await res.json()
      const attestation = await startRegistration(options)
      const result = await signIn('webauthn-register', {
        redirect: false,
        email,
        name,
        challengeId,
        response: JSON.stringify(attestation),
      })
      if (result?.error) {
        toast.error(messages.registrationFailed)
        return
      }
      toast.success(messages.registrationSuccess)
      startTransition(() => router.push('/dashboard'))
    } catch {
      toast.error(messages.registrationFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{messages.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder={messages.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{messages.displayName}</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder={messages.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={busy || pending || !email}>
        <Fingerprint className="h-4 w-4" />
        {messages.createAccount}
      </Button>
      <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
        {messages.passkeyExplainer}
      </p>
    </form>
  )
}
