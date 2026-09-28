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
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('consent', 'revoke');
                fbq('init', '2291807841017792');
                try {
                  var stored = localStorage.getItem('granel_cookie_consent');
                  if (stored) {
                    var state = JSON.parse(stored);
                    if (state.ads === 'granted') {
                      fbq('consent', 'grant');
                    }
                  }
                } catch (e) {}
                fbq('track', 'PageView');
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
