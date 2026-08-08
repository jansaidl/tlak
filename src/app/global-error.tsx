'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
        <p style={{ color: '#666', marginTop: 12 }}>
          Please try again. If the problem persists, please contact support.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
