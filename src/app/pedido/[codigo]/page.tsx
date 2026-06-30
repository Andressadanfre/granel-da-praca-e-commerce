import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { CheckoutTopbar } from '@/components/checkout/CheckoutTopbar'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { formatBRL, formatGrams } from '@/lib/utils'
import type { OrderDeliveryType, OrderStatus, PaymentMethod } from '@/lib/orders/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { codigo: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Pedido ${params.codigo.toUpperCase()} | Granel da Praça`,
    robots: { index: false },
  }
}

function paymentLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    pix:            'PIX',
    cartao_credito: 'Cartão de crédito/débito',
    cartao_debito:  'Cartão de débito',
    dinheiro:       'Dinheiro na entrega',
    alelo:          'Alelo na entrega',
  }
  return labels[method] ?? method
}

function statusMessage(
  status: OrderStatus,
  deliveryType: OrderDeliveryType,
  paymentMethod: PaymentMethod,
  paymentStatus: string,
): { title: string; sub: string } {
  if (status === 'cancelado') {
    return {
      title: 'Pedido cancelado',
      sub:   'Este pedido foi cancelado. Em caso de dúvidas, entre em contato pelo WhatsApp.',
    }
  }
  if (paymentStatus === 'pendente'
    && (paymentMethod === 'pix' || paymentMethod === 'cartao_credito')) {
    return {
      title: 'Aguardando confirmação do pagamento',
      sub:   'Assim que o pagamento for aprovado, seu pedido entrará na fila. Você será avisado pelo WhatsApp.',
    }
  }
  return {
    title: 'Pedido confirmado! 🎉',
    sub:   deliveryType === 'retirada'
      ? 'Recebemos seu pedido. Você receberá uma mensagem no WhatsApp quando estiver pronto para retirada.'
      : 'Recebemos seu pedido e já começamos a preparar. Atualizações pelo WhatsApp.',
  }
}

export default async function PedidoPage({ params }: Props) {
  const supabase = getSupabaseAdmin()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('code', params.codigo.toUpperCase())
    .eq('is_deleted', false)
    .single()

  if (error || !order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('id')

  const orderItems = items ?? []
  const itemCount = orderItems.length

  // item_total_cents já foi calculado server-side no momento do pedido — usar diretamente
  const subtotalCents = orderItems.reduce((acc, item) => acc + item.item_total_cents, 0)

  const msg = statusMessage(
    order.status as OrderStatus,
    order.delivery_type as OrderDeliveryType,
    order.payment_method as PaymentMethod,
    order.payment_status,
  )

  const isPending = order.payment_status === 'pendente'
    && (order.payment_method === 'pix' || order.payment_method === 'cartao_credito')

  const deliveryAddress = order.delivery_address as {
    street?: string; number?: string; complement?: string
    neighborhood?: string; city?: string
  } | null

  const heroColor = order.status === 'cancelado'
    ? { wrap: 'bg-[#FEF2F2] border-[#FECACA]', stroke: '#EF4444' }
    : isPending
      ? { wrap: 'bg-[#FEF3C7] border-[#FDE68A]', stroke: '#D97706' }
      : { wrap: 'bg-[#ECFDF5] border-[#A7F3D0]', stroke: '#065F46' }

  return (
    <div className="min-h-screen bg-cream">
      <CheckoutTopbar activeStep="confirmacao" />

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-4 items-start">

        {/* ─── Sidebar ─── */}
        <div className="w-full sm:w-[296px] flex-shrink-0 sm:order-last flex flex-col gap-3.5">

          {/* Resumo */}
          <div className="bg-white border border-bd rounded-inner overflow-hidden shadow-card">
            <div className="px-[18px] py-3.5 border-b border-bd flex items-center justify-between">
              <span className="text-[13px] font-semibold text-t9">Resumo do pedido</span>
              <span className="text-[11px] font-medium text-t4">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="px-[18px] py-4">
              <ul className="flex flex-col mb-3.5">
                {orderItems.map(item => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2.5 py-2.5 border-b border-surface last:border-b-0 last:pb-0 first:pt-0"
                  >
                    <div className="w-11 h-11 rounded-input border border-bd bg-surface flex-shrink-0 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 88 88" fill="none" className="opacity-20">
                        <rect x="8" y="28" width="72" height="52" rx="6" fill="#002603" />
                        <ellipse cx="44" cy="28" rx="20" ry="8" fill="#002603" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-t9 truncate">{item.product_name}</p>
                      <p className="text-[10px] text-t4 mt-0.5">
                        {item.product_type === 'granel'
                          ? formatGrams(item.quantity_grams ?? 0)
                          : `${item.quantity_units ?? 0} un`}
                      </p>
                    </div>
                    <span className="text-[12px] font-bold text-t9 whitespace-nowrap">
                      {formatBRL(item.item_total_cents)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-dashed border-bd my-3" />

              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-t4">Subtotal</span>
                <span className="text-[12px] font-medium text-t6">{formatBRL(subtotalCents)}</span>
              </div>

              {order.discount_cents > 0 && (
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] text-t4">
                    {order.payment_method === 'pix' ? 'Desconto PIX (5%)' : 'Desconto'}
                  </span>
                  <span className="text-[12px] font-semibold text-[#065F46]">
                    − {formatBRL(order.discount_cents)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-t4">Frete</span>
                {order.shipping_cents === 0
                  ? <span className="text-[12px] font-semibold text-[#065F46]">Grátis</span>
                  : <span className="text-[12px] font-medium text-t6">{formatBRL(order.shipping_cents)}</span>
                }
              </div>

              <div className="flex justify-between items-baseline mt-2.5 pt-3 border-t-2 border-bd">
                <span className="text-[14px] font-semibold text-t9">Total</span>
                <span className="text-[24px] font-bold text-gdeep tracking-[-0.02em] leading-none">
                  {formatBRL(order.total_cents)}
                </span>
              </div>

              {/* Forma de pagamento */}
              <div className="mt-3.5 px-3 py-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-input flex items-center gap-2.5 text-[12px] font-medium text-[#065F46]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                {paymentLabel(order.payment_method as PaymentMethod)}
              </div>
            </div>
          </div>

          {/* Endereço de entrega */}
          {deliveryAddress && (
            <div className="bg-white border border-bd rounded-inner px-[18px] py-4 shadow-card">
              <p className="text-[11px] font-semibold text-t4 uppercase tracking-[0.06em] mb-2">
                Endereço de entrega
              </p>
              <p className="text-[12px] font-medium text-t9 leading-snug">
                {deliveryAddress.street}, {deliveryAddress.number}
                {deliveryAddress.complement && `, ${deliveryAddress.complement}`}
                <br />
                {deliveryAddress.neighborhood} — {deliveryAddress.city ?? 'Uberlândia'}/MG
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-gd bg-[#DCFCE7] px-2 py-0.5 rounded-pill">
                Entrega motoboy
              </span>
            </div>
          )}

          {/* Retirada */}
          {order.delivery_type === 'retirada' && !deliveryAddress && (
            <div className="bg-white border border-bd rounded-inner px-[18px] py-4 shadow-card">
              <p className="text-[11px] font-semibold text-t4 uppercase tracking-[0.06em] mb-2">
                Retirada na loja
              </p>
              <p className="text-[12px] font-medium text-t9 leading-snug">
                Fundinho — Praça Clarimundo Carneiro, 119<br />
                Seg–Sáb · 8h às 18h
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo bg-indigo-bg px-2 py-0.5 rounded-pill">
                Frete grátis
              </span>
            </div>
          )}

          {/* WhatsApp */}
          <div className="flex bg-[#F0FDF4] border border-[#BBF7D0] rounded-inner px-3.5 py-2.5 items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#00B207" className="flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            <p className="text-[11px] text-[#166534] leading-snug flex-1">
              Tive um problema com meu pedido
            </p>
            <a
              href={`https://wa.me/5534997819292?text=${encodeURIComponent(`Olá! Tive um problema com meu pedido ${order.code}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-g text-white rounded-input px-3 py-1.5 text-[11px] font-semibold hover:bg-gd transition-colors whitespace-nowrap"
            >
              Chamar
            </a>
          </div>

          {/* Continuar comprando */}
          <a
            href="/loja"
            className="w-full h-11 bg-white border-[1.5px] border-bd rounded-inner text-[13px] font-medium text-t6 flex items-center justify-center gap-2 hover:border-gd hover:text-gd transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Continuar comprando
          </a>
        </div>

        {/* ─── Col principal ─── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3.5 w-full">

          {/* Hero de sucesso */}
          <div className="bg-white border border-bd rounded-inner px-6 py-8 text-center shadow-card overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 checkout-shimmer-bar" />

            <div className={`w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center mx-auto mb-4 checkout-pop-in ${heroColor.wrap}`}>
              {order.status === 'cancelado' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={heroColor.stroke} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : isPending ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={heroColor.stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={heroColor.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" strokeDasharray="40" strokeDashoffset="0" />
                </svg>
              )}
            </div>

            <h1 className="text-[20px] font-bold text-t9 tracking-[-0.02em] mb-1.5">
              {msg.title}
            </h1>
            <p className="text-[13px] text-t6 leading-relaxed max-w-[380px] mx-auto mb-5">
              {msg.sub}
            </p>

            <div className="inline-flex items-center gap-2 bg-surface border border-bd rounded-pill px-4 py-1.5">
              <span className="text-[11px] text-t4 font-medium">Número do pedido</span>
              <strong className="text-[13px] font-bold text-t9">{order.code}</strong>
            </div>
          </div>

          {/* Timeline */}
          <OrderTimeline
            status={order.status as OrderStatus}
            deliveryType={order.delivery_type as OrderDeliveryType}
            createdAt={order.created_at}
          />

          {/* Fidelidade — stub (dados reais: Fase 6) */}
          <div className="bg-white border border-bd rounded-inner overflow-hidden shadow-card">
            <div className="px-5 py-4 border-b border-bd flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-input bg-[#FFF9C4] border border-[#FDE68A] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-t9">Cartão Fidelidade Granel da Praça</p>
                <p className="text-[10px] text-t4 font-medium mt-0.5">
                  10 carimbos = R$ 15,00 de desconto na próxima compra
                </p>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-10 gap-2 mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-full flex items-center justify-center bg-surface border-2 border-dashed border-bd"
                  >
                    <span className="text-[9px] font-semibold text-t4">{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-input px-3 py-2.5 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-g flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-[12px] text-[#065F46] leading-relaxed">
                  A cada <strong>R$ 50,00</strong> em compras você ganha 1 carimbo.
                  Com <strong>10 carimbos</strong> você ganha <strong>R$ 15,00 de desconto</strong>!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
