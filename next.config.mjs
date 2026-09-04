import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // dev e build/produção nunca compartilham cache — evita corrupção quando
  // o build roda (checagem de tipos) com o dev server ainda vivo
  distDir: isDev ? '.next-dev' : '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ymjmgukuojwumvtaglyp.supabase.co',
        pathname: '/storage/v1/object/public/product-images/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/llms.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
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
                  "connect-src 'self' https://*.supabase.co ws://localhost:* http://localhost:* https://*.ingest.us.sentry.io",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https:",
                  "font-src 'self' https://fonts.gstatic.com",
                  "connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io https://*.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://www.google.com https://*.doubleclick.net",
                ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Vary',
            value: 'Accept, Accept-Encoding',
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'granel-da-praca-ecommerce',
  project: 'granel-ecommerce',
  silent: !process.env.CI,
})
