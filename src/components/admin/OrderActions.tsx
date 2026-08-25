'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { updateOrderStatus } from '@/lib/admin/actions'
import type { AdminOrder, OrderStatus, DeliveryType } from '@/types/admin'

interface OrderActionsProps {
  order: AdminOrder
}

interface NextAction {
  status: OrderStatus
  label: string
  variant: 'primary' | 'danger'
}

function getNextActions(status: OrderStatus, deliveryType: DeliveryType): NextAction[] {
  switch (status) {
    case 'recebido':
      return [
        { status: 'aceito', label: 'Aceitar pedido', variant: 'primary' },
        { status: 'cancelado', label: 'Cancelar pedido', variant: 'danger' },
      ]
    case 'aceito':
      return [
        { status: 'em_separacao', label: 'Iniciar separação', variant: 'primary' },
        { status: 'cancelado', label: 'Cancelar pedido', variant: 'danger' },
      ]
    case 'em_separacao':
      return [
        {
          status: deliveryType === 'entrega' ? 'saiu_para_entrega' : 'pronto_para_retirada',
          label: deliveryType === 'entrega' ? 'Marcar saiu para entrega' : 'Marcar pronto para retirada',
          variant: 'primary',
        },
        { status: 'cancelado', label: 'Cancelar pedido', variant: 'danger' },
      ]
    case 'saiu_para_entrega':
      return [{ status: 'entregue', label: 'Confirmar entrega', variant: 'primary' }]
    case 'pronto_para_retirada':
      return [{ status: 'retirado', label: 'Confirmar retirada', variant: 'primary' }]
    case 'entregue':
    case 'retirado':
    case 'cancelado':
      return []
  }
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const nextActions = getNextActions(order.status, order.delivery_type)
  const requiresReason = order.status === 'em_separacao'

  const isOnlineMethod = order.payment_method === 'pix' || order.payment_method === 'cartao_credito' || order.payment_method === 'cartao_debito'
  const paymentUnconfirmed = order.status === 'recebido' && isOnlineMethod && order.payment_status === 'pendente'

  function handleAction(action: NextAction) {
    setError(null)

    if (action.status === 'cancelado' && requiresReason && !reason.trim()) {
      setError('Informe o motivo do cancelamento antes de continuar.')
      return
    }

    startTransition(async () => {
      const result = await updateOrderStatus(
        order.id,
        action.status,
        order.delivery_type,
        action.status === 'cancelado' ? reason.trim() || undefined : undefined,
      )

      if (!result.success) {
        setError(result.error ?? 'Erro interno')
        return
      }

      router.refresh()
    })
  }

  if (nextActions.length === 0) {
    return (
      <div className="rounded-card border border-bd bg-white p-5 shadow-card">
        <h2 className="mb-2 text-[13px] font-semibold text-t9">Ações do pedido</h2>
        <p className="text-[12px] text-t4">Nenhuma ação disponível para este pedido.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-bd bg-white p-5 shadow-card">
      <h2 className="text-[13px] font-semibold text-t9">Ações do pedido</h2>

      {paymentUnconfirmed && (
        <div className="flex flex-col gap-1 rounded-inner border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-[#92400E]">Pagamento ainda não confirmado</p>
          <p className="text-[11px] text-[#78350F]">
            Não separe os itens antes da confirmação. Se o cliente já avisou que pagou,
            confira antes de aceitar mesmo assim.
          </p>
        </div>
      )}

      {requiresReason && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cancel-reason" className="text-[11px] font-medium text-t6">
            Motivo do cancelamento (obrigatório para cancelar)
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="rounded-input border border-bd px-3 py-2 text-[12px] text-t9 outline-none focus:border-g"
          />
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-danger">{error}</p>}

      <div className="flex flex-col gap-2">
        {nextActions.map(action => {
          const isAcceptWithUnconfirmedPayment = action.status === 'aceito' && paymentUnconfirmed
          return (
            <button
              key={action.status}
              type="button"
              disabled={isPending}
              onClick={() => handleAction(action)}
              className={
                isAcceptWithUnconfirmedPayment
                  ? 'flex h-10 items-center justify-center rounded-sel border border-[#FDE68A] text-[12.5px] font-semibold text-[#92400E] transition-colors hover:bg-[#FFFBEB] disabled:opacity-50'
                  : action.variant === 'danger'
                    ? 'flex h-10 items-center justify-center rounded-sel border border-danger text-[12.5px] font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50'
                    : 'flex h-10 items-center justify-center rounded-sel bg-g text-[12.5px] font-semibold text-white transition-colors hover:bg-ghover disabled:opacity-50'
              }
            >
              {isPending ? 'Enviando...' : isAcceptWithUnconfirmedPayment ? 'Já recebi a confirmação — aceitar mesmo assim' : action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
