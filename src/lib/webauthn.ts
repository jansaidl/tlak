export const RP_ID = process.env.WEBAUTHN_RP_ID ?? 'localhost'
export const RP_NAME = process.env.WEBAUTHN_RP_NAME ?? 'Tlak'
export const ORIGIN = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000'

// Accept multiple origins if configured (comma-separated). Useful when the
// app is reachable on both the Zerops subdomain and a custom domain.
export function expectedOrigins(): string[] {
  return ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
}
