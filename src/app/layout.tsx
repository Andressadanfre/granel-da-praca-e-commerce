import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { CartProvider } from '@/components/cart/CartProvider'
import { NewsletterPopup } from '@/components/features/NewsletterPopup'
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
        <CartProvider>
          <NewsletterPopup />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
