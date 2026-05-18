'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h2 style={{ marginBottom: '16px' }}>Erro crítico.</h2>
        <button
          onClick={reset}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
