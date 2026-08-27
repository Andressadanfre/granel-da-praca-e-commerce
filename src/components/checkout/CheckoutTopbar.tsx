import Image from 'next/image'
import Link from 'next/link'

type Step = 'carrinho' | 'checkout' | 'confirmacao'

interface CheckoutTopbarProps {
  activeStep: Step
}

export function CheckoutTopbar({ activeStep }: CheckoutTopbarProps) {
  const steps: { key: Step; label: string }[] = [
    { key: 'carrinho', label: 'Carrinho' },
    { key: 'checkout', label: 'Checkout' },
    { key: 'confirmacao', label: 'Confirmação' },
  ]

  function stepClass(key: Step) {
    const idx = steps.findIndex(s => s.key === key)
    const activeIdx = steps.findIndex(s => s.key === activeStep)
    if (idx < activeIdx) return 'bg-[#DCFCE7] text-[#166534]'
    if (idx === activeIdx) return 'bg-gdeep text-white'
    return 'bg-surface text-t4 border border-bd'
  }

  return (
    <header className="bg-white border-b border-bd sticky top-0 z-50 shadow-nav">
      <div className="max-w-container mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-8 shrink-0 items-center no-underline sm:h-11"
          aria-label="Granel da Praça — página inicial"
        >
          <Image
            src="/images/logo-green.png"
            alt=""
            width={210}
            height={44}
            priority
            className="h-8 w-auto sm:h-11"
          />
        </Link>

        <div className="hidden sm:flex items-center gap-1 text-[11px]">
          {steps.map((step, idx) => (
            <span key={step.key} className="flex items-center gap-1">
              {idx > 0 && (
                <span className="text-bd text-[10px] px-0.5">›</span>
              )}
              <span className={`px-[10px] py-1 rounded-pill font-semibold ${stepClass(step.key)}`}>
                {step.label}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-t6 font-medium">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
            strokeLinejoin="round" className="text-gd"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Compra segura
        </div>
      </div>
    </header>
  )
}
