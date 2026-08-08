import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types'
import { eq, and, lt } from 'drizzle-orm'
import { db } from '@/db'
import { users, passkeys, webauthnChallenges } from '@/db/schema'
import { RP_ID, expectedOrigins } from '@/lib/webauthn'

async function consumeChallenge(id: string) {
  const rows = await db
    .select()
    .from(webauthnChallenges)
    .where(eq(webauthnChallenges.id, id))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, id))
  // Best-effort GC of stale challenges.
  await db.delete(webauthnChallenges).where(lt(webauthnChallenges.expiresAt, new Date()))
  if (row.expiresAt.getTime() < Date.now()) return null
  return row
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/en/login',
  },
  providers: [
    Credentials({
      id: 'webauthn-register',
      name: 'Passkey registration',
      credentials: {
        challengeId: {},
        email: {},
        name: {},
        response: {},
      },
      async authorize(input) {
        const email = String(input?.email ?? '').trim().toLowerCase()
        const name = String(input?.name ?? '').trim() || null
        const challengeId = String(input?.challengeId ?? '')
        const responseRaw = String(input?.response ?? '')
        if (!email || !challengeId || !responseRaw) return null

        const challenge = await consumeChallenge(challengeId)
        if (!challenge || challenge.kind !== 'registration' || challenge.email !== email)
          return null

        let parsed: RegistrationResponseJSON
        try {
          parsed = JSON.parse(responseRaw)
        } catch {
          return null
        }

        const verification = await verifyRegistrationResponse({
          response: parsed,
          expectedChallenge: challenge.challenge,
          expectedOrigin: expectedOrigins(),
          expectedRPID: RP_ID,
          requireUserVerification: true,
        }).catch(() => null)

        if (!verification?.verified || !verification.registrationInfo) return null

        // Reject if email already exists (a real duplicate registration attempt).
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
        if (existing[0]) return null

        const [user] = await db
          .insert(users)
          .values({ email, name })
          .returning({ id: users.id, email: users.email, name: users.name, locale: users.locale })

        const info = verification.registrationInfo
        const credentialIdB64 = Buffer.from(info.credentialID).toString('base64url')
        await db.insert(passkeys).values({
          credentialId: credentialIdB64,
          userId: user.id,
          publicKey: Buffer.from(info.credentialPublicKey).toString('base64url'),
          counter: info.counter,
          deviceType: info.credentialDeviceType,
          backedUp: info.credentialBackedUp,
          transports: parsed.response.transports?.join(',') ?? null,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
    Credentials({
      id: 'webauthn-login',
      name: 'Passkey login',
      credentials: {
        challengeId: {},
        response: {},
      },
      async authorize(input) {
        const challengeId = String(input?.challengeId ?? '')
        const responseRaw = String(input?.response ?? '')
        if (!challengeId || !responseRaw) return null

        const challenge = await consumeChallenge(challengeId)
        if (!challenge || challenge.kind !== 'authentication') return null

        let parsed: AuthenticationResponseJSON
        try {
          parsed = JSON.parse(responseRaw)
        } catch {
          return null
        }

        const pkRows = await db
          .select()
          .from(passkeys)
          .where(eq(passkeys.credentialId, parsed.id))
          .limit(1)
        const pk = pkRows[0]
        if (!pk) return null

        const verification = await verifyAuthenticationResponse({
          response: parsed,
          expectedChallenge: challenge.challenge,
          expectedOrigin: expectedOrigins(),
          expectedRPID: RP_ID,
          requireUserVerification: true,
          authenticator: {
            credentialID: Buffer.from(pk.credentialId, 'base64url'),
            credentialPublicKey: Buffer.from(pk.publicKey, 'base64url'),
            counter: pk.counter,
            transports: (pk.transports?.split(',') as any) ?? undefined,
          },
        }).catch(() => null)

        if (!verification?.verified) return null

        await db
          .update(passkeys)
          .set({
            counter: verification.authenticationInfo.newCounter,
            lastUsedAt: new Date(),
          })
          .where(and(eq(passkeys.credentialId, pk.credentialId)))

        const uRows = await db.select().from(users).where(eq(users.id, pk.userId)).limit(1)
        const u = uRows[0]
        if (!u) return null

        return { id: u.id, email: u.email, name: u.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid as string
      }
      return session
    },
  },
})
