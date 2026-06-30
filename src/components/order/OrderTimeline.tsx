import type { OrderStatus, OrderDeliveryType } from '@/lib/orders/types'

interface TimelineStep {
  status: OrderStatus
  label: string
  desc: string
}

function getSteps(deliveryType: OrderDeliveryType): TimelineStep[] {
  const base: TimelineStep[] = [
    { status: 'recebido',     label: 'Pedido recebido',    desc: 'Seu pedido foi confirmado e entrou na fila' },
    { status: 'aceito',       label: 'Pedido aceito',      desc: 'A equipe aceitou e iniciou a preparação' },
    { status: 'em_separacao', label: 'Em separação',       desc: 'Os produtos estão sendo pesados e embalados' },
  ]
  if (deliveryType === 'retirada') {
    return [
      ...base,
      { status: 'pronto_para_retirada', label: 'Pronto para retirada', desc: 'Seu pedido está pronto! Pode vir buscar' },
      { status: 'retirado',             label: 'Retirado',              desc: 'Pedido retirado na loja — obrigada!' },
    ]
  }
  return [
    ...base,
    { status: 'saiu_para_entrega', label: 'Saiu para entrega', desc: 'O motoboy está a caminho com seu pedido' },
    { status: 'entregue',          label: 'Entregue',          desc: 'Pedido entregue com sucesso — obrigada!' },
  ]
}

const STATUS_ORDER: Record<OrderStatus, number> = {
  recebido:              0,
  aceito:                1,
  em_separacao:          2,
  saiu_para_entrega:     3,
  pronto_para_retirada:  3,
  entregue:              4,
  retirado:              4,
  cancelado:             -1,
}

interface OrderTimelineProps {
  status: OrderStatus
  deliveryType: OrderDeliveryType
  createdAt: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day:    '2-digit',
    month:  '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

export function OrderTimeline({ status, deliveryType, createdAt }: OrderTimelineProps) {
  const steps = getSteps(deliveryType)
  const currentIdx = STATUS_ORDER[status] ?? -1
  const isCancelled = status === 'cancelado'

  return (
    <div className="bg-white border border-bd rounded-inner px-5 py-5 shadow-card">
      <p className="text-[13px] font-semibold text-t9 mb-5">
        Acompanhe seu pedido
      </p>

      {isCancelled && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-input px-3.5 py-3 text-[12px] font-medium text-danger mb-4">
          Este pedido foi cancelado. Entre em contato pelo WhatsApp se precisar de ajuda.
        </div>
      )}

      <div className="flex flex-col">
        {steps.map((step, idx) => {
          const isDone   = currentIdx > idx
          const isActive = currentIdx === idx && !isCancelled
          const state    = isDone ? 'done' : isActive ? 'active' : 'pending'

          return (
            <div key={step.status} className="flex gap-3.5 items-start relative">
              {/* Linha vertical entre steps */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-[13px] top-7 w-0.5 h-[calc(100%+4px)] z-0 ${
                    isDone ? 'bg-g' : 'bg-bd'
                  }`}
                />
              )}

              {/* Dot */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  state === 'done'
                    ? 'bg-g border-2 border-g'
                    : state === 'active'
                      ? 'bg-white border-[2.5px] border-g'
                      : 'bg-white border-2 border-bd'
                }`}
              >
                {/* Pulse no ativo */}
                {state === 'active' && (
                  <span className="absolute inset-[-5px] rounded-full bg-[rgba(0,178,7,0.15)] checkout-timeline-pulse" />
                )}
                {state === 'done' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      state === 'active' ? 'bg-g' : 'bg-[#D1D5DB]'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 flex-1 ${idx === steps.length - 1 ? 'pb-0' : ''}`}>
                <p
                  className={`text-[13px] font-semibold leading-snug ${
                    state === 'done'
                      ? 'text-t9'
                      : state === 'active'
                        ? 'text-gd'
                        : 'text-[#6B7280]'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-[11px] mt-0.5 leading-snug ${
                    state === 'done'
                      ? 'text-t6'
                      : state === 'active'
                        ? 'text-gd'
                        : 'text-t4'
                  }`}
                >
                  {step.desc}
                </p>
                {state === 'done' && idx === 0 && (
                  <p className="text-[10px] text-t4 mt-0.5 font-medium">
                    {formatDate(createdAt)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
