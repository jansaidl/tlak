import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { db } from '@/db'
import { webauthnChallenges } from '@/db/schema'
import { RP_ID } from '@/lib/webauthn'

export const runtime = 'nodejs'

export async function POST() {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'preferred',
  })

  const [challenge] = await db
    .insert(webauthnChallenges)
    .values({
      challenge: options.challenge,
      kind: 'authentication',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    .returning({ id: webauthnChallenges.id })

  return NextResponse.json({ options, challengeId: challenge.id })
}
