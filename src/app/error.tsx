'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '16px' }}>Algo deu errado.</h2>
      <button
        onClick={reset}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        Tentar novamente
      </button>
    </main>
  )
}
