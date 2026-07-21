/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // dev e build/produção nunca compartilham cache — evita corrupção quando
  // o build roda (checagem de tipos) com o dev server ainda vivo
  distDir: isDev ? '.next-dev' : '.next',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: isDev
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
                  "connect-src 'self' https://*.supabase.co ws://localhost:* http://localhost:*",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline'",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https:",
                  "font-src 'self' https://fonts.gstatic.com",
                  "connect-src 'self' https://*.supabase.co",
                ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
