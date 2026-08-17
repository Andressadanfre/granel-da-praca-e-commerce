import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Script from 'next/script'
import { CartProvider } from '@/components/cart/CartProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { NewsletterPopup } from '@/components/features/NewsletterPopup'
import { CookieConsentBanner } from '@/components/features/CookieConsentBanner'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Granel da Praça — Produtos Naturais a Granel',
  description: 'Loja online de Produtos Naturais a granel em Uberlândia. Castanhas, grãos, suplementos e muito mais.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            window.gtag = gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted',
              wait_for_update: 500,
              region: ['BR']
            });
            try {
              var stored = localStorage.getItem('granel_cookie_consent');
              if (stored) {
                var state = JSON.parse(stored);
                gtag('consent', 'update', {
                  analytics_storage: state.analytics,
                  ad_storage: state.ads,
                  ad_user_data: state.ads,
                  ad_personalization: state.ads,
                });
              }
            } catch (e) {}
          `}
        </Script>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-C6W30XMXN3"
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.gtag('js', new Date());
                window.gtag('config', 'G-C6W30XMXN3');
              `}
            </Script>
          </>
        )}
        <ToastProvider>
          <CartProvider>
            <NewsletterPopup />
            {children}
            <CookieConsentBanner />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
