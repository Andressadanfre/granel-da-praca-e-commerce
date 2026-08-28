import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import * as Sentry from '@sentry/nextjs'

import { createLogger, logError, logWarn } from '@/lib/logger'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { webhookRatelimit } from '@/lib/rate-limit'
import { mapMpStatusToPaymentStatus, verifyMpSignature } from '@/lib/orders/mercadopago-webhook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const xRequestId = request.headers.get('x-request-id')
  const log = createLogger({
    action: 'mpWebhook',
    requestId: xRequestId ?? crypto.randomUUID(),
  })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success: rateLimitOk } = await webhookRatelimit.limit(ip)

  if (!rateLimitOk) {
    logWarn(log, { route: '/api/webhooks/mercadopago', ip }, 'Rate limit excedido no webhook')
    return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    logError(
      log,
      new Error('MERCADOPAGO_WEBHOOK_SECRET não configurado'),
      { route: '/api/webhooks/mercadopago' },
      'Webhook secret ausente',
    )
    Sentry.captureException(new Error('MERCADOPAGO_WEBHOOK_SECRET não configurado'))
    return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
  }

  const xSignature = request.headers.get('x-signature')
  const url = new URL(request.url)
  const dataId = url.searchParams.get('data.id')

  logWarn(
    log,
    { route: '/api/webhooks/mercadopago', debug_xSignature: xSignature, debug_xRequestId: xRequestId, debug_dataId: dataId },
    'DEBUG TEMPORARIO - valores brutos recebidos no webhook (remover depois)',
  )

  if (!xSignature || !dataId) {
    logWarn(log, { route: '/api/webhooks/mercadopago' }, 'Webhook recebido sem assinatura ou data.id')
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const isValid = verifyMpSignature(xSignature, xRequestId, dataId, secret)
  if (!isValid) {
    logWarn(
      log,
      { route: '/api/webhooks/mercadopago' },
      'Assinatura de webhook inválida — possível tentativa de forjar notificação',
    )
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let body: { type?: string; data?: { id?: string | number } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (body.type !== 'payment') {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return NextResponse.json({ error: 'payment id ausente' }, { status: 400 })
  }

  if (String(paymentId).toLowerCase() !== dataId.toLowerCase()) {
    logWarn(
      log,
      { route: '/api/webhooks/mercadopago', payment_id: paymentId },
      'data.id da query não corresponde ao body',
    )
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    logError(
      log,
      new Error('MERCADOPAGO_ACCESS_TOKEN não configurado'),
      { route: '/api/webhooks/mercadopago', payment_id: paymentId },
      'Access token ausente',
    )
    return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
  }

  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!mpResponse.ok) {
    logError(
      log,
      new Error(`MP API retornou ${mpResponse.status}`),
      { route: '/api/webhooks/mercadopago', payment_id: paymentId },
      'Falha ao buscar pagamento na API do MP',
    )
    Sentry.captureException(new Error(`MP API retornou ${mpResponse.status}`), {
      extra: { payment_id: paymentId },
    })
    return NextResponse.json({ error: 'Falha ao verificar pagamento' }, { status: 502 })
  }

  const payment = await mpResponse.json()
  const orderId = payment.external_reference as string | undefined
  const newStatus = mapMpStatusToPaymentStatus(payment.status as string)

  if (!orderId || !UUID_REGEX.test(orderId) || !newStatus) {
    logWarn(
      log,
      { route: '/api/webhooks/mercadopago', payment_id: paymentId },
      'external_reference ausente, inválido ou status MP desconhecido',
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const admin = getSupabaseAdmin()
  const { data: rpcResult, error: updateError } = await admin
    .rpc('update_order_payment_status', {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_mp_payment_id: String(paymentId),
    })

  const updated = rpcResult?.[0]?.updated ? { id: rpcResult[0].id } : null
  const orderFound = rpcResult?.[0]?.order_found ?? false

  if (updateError) {
    logError(
      log,
      updateError,
      { route: '/api/webhooks/mercadopago', order_id: orderId },
      'Falha ao atualizar payment_status do pedido',
    )
    Sentry.captureException(updateError, { extra: { order_id: orderId, payment_id: paymentId } })
    return NextResponse.json({ error: 'Falha ao processar' }, { status: 500 })
  }

  if (!updated) {
    logWarn(
      log,
      { route: '/api/webhooks/mercadopago', order_id: orderId, payment_id: paymentId },
      orderFound
        ? 'Update de payment_status bloqueado — status atual já é igual ou mais avançado que o recebido (possível webhook fora de ordem)'
        : 'Pedido não encontrado para external_reference',
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
