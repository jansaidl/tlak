export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24 }}>Not found</h1>
      <p style={{ color: '#666', marginTop: 12 }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#3b82f6' }}>
        Go home
      </a>
    </div>
  )
}
