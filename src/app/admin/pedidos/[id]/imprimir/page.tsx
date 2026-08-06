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
        .cupom-print { width: 72mm; margin: 0 auto; padding: 8px; font-family: 'Poppins', monospace; font-size: 11px; color: #000; background: #fff; line-height: 1.4; }
        .cupom-header { text-align: center; padding-bottom: 8px; border-bottom: 1px dashed #999; margin-bottom: 8px; }
        .cupom-logo { font-size: 16px; font-weight: 700; letter-spacing: -.02em; color: #000; margin-bottom: 2px; }
        .cupom-tagline { font-size: 9px; color: #555; letter-spacing: .04em; }
        .cupom-titulo { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-top: 8px; color: #000; }
        .cupom-subtitulo { font-size: 9px; color: #555; margin-top: 1px; }
        .codigo-destaque {
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: .08em;
          color: #000;
          padding: 8px 0 4px;
          border-top: 2px solid #000;
          margin-top: 4px;
        }
        .codigo-sub {
          text-align: center;
          font-size: 8.5px;
          color: #555;
          margin-bottom: 4px;
        }
        .divisor { border: none; border-top: 1px dashed #999; margin: 7px 0; }
        .divisor-solid { border: none; border-top: 1px solid #000; margin: 7px 0; }
        .cupom-dados { margin-bottom: 4px; }
        .cupom-linha { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 2px 0; font-size: 10.5px; }
        .cupom-key { color: #555; white-space: nowrap; font-size: 9.5px; flex-shrink: 0; }
        .cupom-val { font-weight: 600; color: #000; text-align: right; }
        .tipo-badge-print { display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 6px; border: 1.5px solid #000; border-radius: 100px; text-transform: uppercase; letter-spacing: .06em; }
        .obs-box { border: 2px solid #000; border-radius: 4px; padding: 6px 8px; margin: 8px 0; background: #fff; }
        .obs-titulo { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #000; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
        .obs-titulo::before { content: '!'; display: inline-flex; width: 13px; height: 13px; border-radius: 50%; background: #000; color: #fff; font-size: 9px; font-weight: 900; align-items: center; justify-content: center; flex-shrink: 0; line-height: 1; }
        .obs-texto { font-size: 11px; color: #000; font-weight: 500; line-height: 1.5; }
        .items-header { display: grid; grid-template-columns: 1fr 52px 52px 22px; gap: 4px; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #555; padding: 3px 0; border-bottom: 1px solid #000; margin-bottom: 2px; }
        .items-header span:not(:first-child) { text-align: right; }
        .item-row { display: grid; grid-template-columns: 1fr 52px 52px 22px; gap: 4px; padding: 5px 0; border-bottom: 1px dashed #ccc; align-items: start; }
        .item-row:last-child { border-bottom: none; }
        .item-nome { font-size: 11px; font-weight: 600; color: #000; line-height: 1.3; }
        .item-cod { font-size: 9px; color: #555; margin-top: 1px; }
        .item-qty { font-size: 12px; font-weight: 700; color: #000; text-align: right; line-height: 1.3; }
        .item-qty-unit { font-size: 9px; color: #555; text-align: right; }
        .item-total { font-size: 11px; font-weight: 700; color: #000; text-align: right; font-variant-numeric: tabular-nums; line-height: 1.3; }
        .item-check { display: flex; align-items: flex-start; justify-content: flex-end; padding-top: 2px; }
        .check-box-print { width: 14px; height: 14px; border: 1.5px solid #000; border-radius: 2px; background: #fff; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .check-box-print.checked { background: #000; }
        .check-box-print.checked::after { content: ''; width: 4px; height: 7px; border: 1.5px solid #fff; border-top: none; border-left: none; transform: rotate(45deg) translateY(-1px); display: block; }
        .totais-block { margin-top: 4px; }
        .total-linha { display: flex; justify-content: space-between; font-size: 10.5px; padding: 2px 0; color: #000; }
        .total-linha.final { font-size: 14px; font-weight: 700; padding-top: 5px; margin-top: 3px; border-top: 2px solid #000; }
        .total-linha span:last-child { font-variant-numeric: tabular-nums; }
        .total-desconto { color: #333; font-style: italic; }
        @media print {
          @page { size: 80mm auto; margin: 4mm; }
          body { background: #fff !important; }
          .item-row { page-break-inside: avoid; }
          * { color: #000 !important; background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .check-box-print.checked { background: #000 !important; }
          .check-box-print.checked::after { border-color: #fff !important; }
        }
      `}</style>

      <script
        dangerouslySetInnerHTML={{ __html: 'window.onload = function () { window.print(); };' }}
      />

      <div className="cupom-print">
        <div className="cupom-header">
          <div className="cupom-logo">GRANEL DA PRAÇA</div>
          <div className="cupom-tagline">Uberlândia · MG · (34) 9 9999-0000</div>
          <div className="cupom-titulo">Cupom de Separação</div>
          <div className="cupom-subtitulo">Documento interno · não é nota fiscal</div>
        </div>

        <div className="codigo-destaque">#{order.code}</div>
        <div className="codigo-sub">
          {formatOrderDateTime(order.created_at)} · Impresso às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <hr className="divisor" />

        <div className="cupom-dados">
          <div className="cupom-linha">
            <span className="cupom-key">Cliente</span>
            <span className="cupom-val">{order.customer_name ?? '—'}</span>
          </div>
          <div className="cupom-linha">
            <span className="cupom-key">Telefone</span>
            <span className="cupom-val">{order.customer_phone ?? '—'}</span>
          </div>
          <div className="cupom-linha">
            <span className="cupom-key">Tipo</span>
            <span className="cupom-val">
              <span className="tipo-badge-print">{DELIVERY_TYPE_LABELS[order.delivery_type]}</span>
            </span>
          </div>
          {deliveryAddress && (
            <div className="cupom-linha">
              <span className="cupom-key">Endereço</span>
              <span className="cupom-val" style={{ textAlign: 'right', fontSize: '10px', lineHeight: 1.4 }}>
                {deliveryAddress.street}, {deliveryAddress.number}
                {deliveryAddress.complement ? ` · ${deliveryAddress.complement}` : ''}
                <br />
                {deliveryAddress.neighborhood}
              </span>
            </div>
          )}
        </div>

        <hr className="divisor" />

        {order.notes && (
          <>
            <div className="obs-box">
              <div className="obs-titulo">Observação do cliente</div>
              <div className="obs-texto">{order.notes}</div>
            </div>
            <hr className="divisor" />
          </>
        )}

        <div className="items-header">
          <span>Produto</span>
          <span>Qtd</span>
          <span>Total</span>
          <span></span>
        </div>

        {items.map(item => (
          <div key={item.id} className="item-row">
            <div>
              <div className="item-nome">{item.product_name}</div>
              <div className="item-cod">
                {item.product_code ? `COD: ${item.product_code} · ` : ''}
                {item.product_type === 'granel' ? 'Granel' : 'Unitário'}
              </div>
            </div>
            <div>
              <div className="item-qty">
                {item.product_type === 'granel'
                  ? formatGrams(item.quantity_grams ?? 0)
                  : `${item.quantity_units ?? 0} un`}
              </div>
              <div className="item-qty-unit">
                {item.product_type === 'granel'
                  ? `${Math.round((item.quantity_grams ?? 0) / 100)} × 100gr`
                  : 'Unitário'}
              </div>
            </div>
            <div className="item-total">{formatBRL(item.item_total_cents)}</div>
            <div className="item-check">
              <div className={`check-box-print${item.is_separated ? ' checked' : ''}`} />
            </div>
          </div>
        ))}

        <hr className="divisor-solid" />

        <div className="totais-block">
          <div className="total-linha">
            <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
            <span>{formatBRL(order.subtotal_cents)}</span>
          </div>
          {order.discount_cents > 0 && (
            <div className="total-linha total-desconto">
              <span>Desconto</span>
              <span>- {formatBRL(order.discount_cents)}</span>
            </div>
          )}
          {order.delivery_type === 'entrega' && (
            <div className="total-linha">
              <span>Frete</span>
              <span>{order.shipping_cents === 0 ? 'GRÁTIS' : formatBRL(order.shipping_cents)}</span>
            </div>
          )}
          <div className="total-linha final">
            <span>TOTAL</span>
            <span>{formatBRL(order.total_cents)}</span>
          </div>
        </div>

        <p className="cupom-linha"><strong>Pagamento:</strong> {PAYMENT_METHOD_LABELS[order.payment_method]}</p>
        <p className="cupom-linha"><strong>Total: {formatBRL(order.total_cents)}</strong></p>

        <hr className="cupom-divisor" />

        <p className="cupom-assinatura">Separado por: _____________________</p>
        <p className="cupom-assinatura">Data: ___/___/______</p>
      </div>
    </>
  )
}
