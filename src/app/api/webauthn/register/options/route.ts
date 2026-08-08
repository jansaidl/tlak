import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users, passkeys, webauthnChallenges } from '@/db/schema'
import { RP_ID, RP_NAME } from '@/lib/webauthn'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const name = String(body?.name ?? '').trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  if (existing[0]) {
    return NextResponse.json({ error: 'email_in_use' }, { status: 409 })
  }

  const options = await generateRegistrationOptions({
    rpID: RP_ID,
    rpName: RP_NAME,
    userID: email,
    userName: email,
    userDisplayName: name || email,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
    excludeCredentials: [],
  })

  const [challenge] = await db
    .insert(webauthnChallenges)
    .values({
      challenge: options.challenge,
      kind: 'registration',
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    .returning({ id: webauthnChallenges.id })

  return NextResponse.json({ options, challengeId: challenge.id })
}
