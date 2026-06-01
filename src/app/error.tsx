'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log apenas em desenvolvimento — error.tsx é error boundary: style inline e tokens inline são intencionais (CSS pode falhar ao carregar)
    if (process.env.NODE_ENV === 'development') {
      console.error('[GlobalError]', {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      })
    }
  }, [error])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#EF4444' }}>Erro de renderização</h2>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#f8f8f2',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '13px',
          maxHeight: '60vh',
        }}
      >
        {error.message}
        {'\n\n'}
        {error.stack}
      </pre>
      {error.digest && (
        <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>
          digest: <code>{error.digest}</code>
        </p>
      )}
      <button
        onClick={reset}
        style={{
          marginTop: '1rem',
          padding: '8px 16px',
          background: '#00B207',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
