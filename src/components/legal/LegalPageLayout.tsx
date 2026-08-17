import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'

interface LegalPageLayoutProps {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <>
      <Navigation />
      <main>
        <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-5 md:py-12 lg:px-20">
          <div className="mx-auto max-w-[760px]">
            <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-t9">
              {title}
            </h1>
            <p className="mt-2 text-[11px] font-medium text-t4">
              Última atualização: {lastUpdated}
            </p>
            <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-t6 [&_h2]:mt-10 [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:text-t9 [&_h2]:first:mt-0 [&_strong]:text-t9 [&_strong]:font-semibold [&_a]:text-gd [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
