import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/checkout/', '/conta/'],
      },
    ],
    sitemap: 'https://graneldapraca.com.br/sitemap.xml',
  }
}
