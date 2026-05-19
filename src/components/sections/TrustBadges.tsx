import { Truck, MessageCircle, ShieldCheck, Leaf } from 'lucide-react'

// ─── Dados estáticos — Server Component, zero JS no cliente ───────────────────
const BADGES = [
  {
    icon: Truck,
    title: 'Frete Grátis',
    subtitle: 'Pedidos acima de R$100',
  },
  {
    icon: MessageCircle,
    title: 'Atendimento WhatsApp',
    subtitle: 'Seg–Sáb, 8h às 18h',
  },
  {
    icon: ShieldCheck,
    title: 'Pagamento Seguro',
    subtitle: 'Pix, cartão e boleto',
  },
  {
    icon: Leaf,
    title: 'Produtos Frescos',
    subtitle: 'Direto dos fornecedores',
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────
export default function TrustBadges() {
  return (
    <section
      aria-label="Diferenciais"
      className="bg-white border-b border-[#E5E7EB]"
    >
      <div className="max-w-[1280px] mx-auto px-5 xl:px-0 py-4">
        {/* Mobile: 2×2 grid | Desktop: 4 colunas */}
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 list-none m-0 p-0">
          {BADGES.map(({ icon: Icon, title, subtitle }, idx) => (
            <li
              key={title}
              className={[
                'flex items-center gap-3 px-4 py-3',
                // Divisores verticais entre itens no desktop
                idx > 0 ? 'lg:border-l lg:border-[#E5E7EB]' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Container do ícone — 40×40px, círculo, DS v3.1 */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#F0FDF4]"
                style={{ width: 40, height: 40 }}
                aria-hidden="true"
              >
                <Icon
                  size={24}
                  strokeWidth={1.6}
                  className="text-[#2C742F]"
                />
              </div>

              {/* Texto */}
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#111827] leading-tight truncate">
                  {title}
                </p>
                <p className="text-[12px] font-normal text-[#4B5563] leading-tight truncate">
                  {subtitle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
