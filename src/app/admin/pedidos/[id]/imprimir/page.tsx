import { notFound } from 'next/navigation'

import { getAdminOrderById } from '@/lib/admin/orders'
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS, formatOrderDateTime } from '@/lib/admin/labels'
import { formatBRL, formatGrams } from '@/lib/utils'

interface Props {
  params: { id: string }
}

interface DeliveryAddressSnapshot {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
}

export default async function ImprimirCupomPage({ params }: Props) {
  const order = await getAdminOrderById(params.id)

  if (!order) notFound()

  const items = order.order_items ?? []
  const deliveryAddress = order.delivery_type === 'entrega'
    ? (order.delivery_address as DeliveryAddressSnapshot | null)
    : null

  return (
    <>
      <style>{`
        .cupom-print { width: 72mm; margin: 0 auto; padding: 8px; font-family: 'Courier New', monospace; font-size: 12px; color: #000; background: #fff; line-height: 1.4; }
        .cupom-header { text-align: center; padding-bottom: 8px; border-bottom: 1px dashed #000; margin-bottom: 8px; }
        .cupom-logo { font-size: 16px; font-weight: 700; }
        .cupom-titulo { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-top: 6px; }
        .cupom-codigo { text-align: center; font-size: 18px; font-weight: 700; margin-top: 10px; }
        .cupom-data { text-align: center; font-size: 10px; color: #555; margin-top: 2px; }
        .cupom-divisor { border: none; border-top: 1px dashed #000; margin: 8px 0; }
        .cupom-linha { font-size: 11px; margin: 3px 0; }
        .cupom-item { margin-bottom: 8px; font-size: 11px; }
        .cupom-check { display: inline-block; width: 12px; height: 12px; border: 1.5px solid #000; margin-right: 6px; vertical-align: middle; }
        .cupom-item-qty { margin-left: 18px; font-size: 10px; color: #333; }
        .cupom-assinatura { font-size: 10.5px; margin-top: 14px; }
        @media print {
          @page { size: 80mm auto; margin: 4mm; }
          body { background: #fff !important; }
        }
      `}</style>

      <script
        dangerouslySetInnerHTML={{ __html: 'window.onload = function () { window.print(); };' }}
      />

      <div className="cupom-print">
        <div className="cupom-header">
          <p className="cupom-logo">GRANEL DA PRAÇA</p>
          <p className="cupom-titulo">Cupom de Separação</p>
        </div>

        <p className="cupom-codigo">#{order.code}</p>
        <p className="cupom-data">{formatOrderDateTime(order.created_at)}</p>

        <hr className="cupom-divisor" />

        <p className="cupom-linha"><strong>Cliente:</strong> {order.customer_name ?? '—'}</p>
        <p className="cupom-linha"><strong>WhatsApp:</strong> {order.customer_phone ?? '—'}</p>
        <p className="cupom-linha"><strong>Tipo:</strong> {DELIVERY_TYPE_LABELS[order.delivery_type]}</p>
        {deliveryAddress && (
          <p className="cupom-linha">
            {deliveryAddress.street}, {deliveryAddress.number}
            {deliveryAddress.complement && ` · ${deliveryAddress.complement}`}
            <br />
            {deliveryAddress.neighborhood} — {deliveryAddress.city ?? 'Uberlândia'}/MG
          </p>
        )}

        <hr className="cupom-divisor" />

        {items.map(item => (
          <div key={item.id} className="cupom-item">
            <span className="cupom-check" />
            <strong>{item.product_code ?? '—'}</strong> · {item.product_name}
            <br />
            <span className="cupom-item-qty">
              {item.product_type === 'granel'
                ? formatGrams(item.quantity_grams ?? 0)
                : `${item.quantity_units ?? 0} un.`}
            </span>
          </div>
        ))}

        <hr className="cupom-divisor" />

        {order.notes && (
          <>
            <p className="cupom-linha"><strong>Observações:</strong></p>
            <p className="cupom-linha">{order.notes}</p>
            <hr className="cupom-divisor" />
          </>
        )}

        <p className="cupom-linha"><strong>Pagamento:</strong> {PAYMENT_METHOD_LABELS[order.payment_method]}</p>
        <p className="cupom-linha"><strong>Total: {formatBRL(order.total_cents)}</strong></p>

        <hr className="cupom-divisor" />

        <p className="cupom-assinatura">Separado por: _____________________</p>
        <p className="cupom-assinatura">Data: ___/___/______</p>
      </div>
    </>
  )
}
