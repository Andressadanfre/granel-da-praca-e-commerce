import { notFound } from 'next/navigation'
import { Mail, Search } from 'lucide-react'

import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

if (process.env.NODE_ENV === 'production') {
  notFound()
}

const buttonVariants: ButtonVariant[] = [
  'primary',
  'cart',
  'secondary',
  'ghost',
  'danger',
]

const badgeVariants: { variant: BadgeVariant; label: string }[] = [
  { variant: 'diet', label: 'Sem glúten' },
  { variant: 'promo', label: 'Promoção' },
  { variant: 'unit', label: 'Por unidade' },
  { variant: 'discount', label: '-15%' },
  { variant: 'low-stock', label: 'Últimas unidades' },
  { variant: 'featured', label: 'Destaque' },
]

export default function PreviewPage() {
  return (
    <main
      className="min-h-screen bg-cream"
      style={{ padding: '40px' }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>
        Preview — componentes UI
      </h1>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Button
        </h2>
        {(['md', 'lg'] as const).map((size) => (
          <div key={size} style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>size: {size}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {buttonVariants.map((variant) => (
                <Button key={`${variant}-${size}`} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Badge
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {badgeVariants.map(({ variant, label }) => (
            <Badge key={variant} variant={variant}>
              {label}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Input
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '400px',
          }}
        >
          <Input label="E-mail" name="email" type="email" />
          <Input label="Nome" iconLeft={Mail} name="name" />
          <Input label="Buscar" iconRight={Search} name="search" />
          <Input
            label="Senha"
            name="password"
            type="password"
            error="Senha deve ter no mínimo 8 caracteres"
          />
        </div>
      </section>
    </main>
  )
}
