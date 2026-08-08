function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24 }}>{statusCode ? `${statusCode} — error` : 'Error'}</h1>
      <p style={{ color: '#666', marginTop: 12 }}>
        {statusCode
          ? 'A server-side error occurred.'
          : 'A client-side error occurred.'}
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#3b82f6' }}>
        Go home
      </a>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
