import crypto from 'node:crypto'

/**
 * Lógica pura do webhook do Mercado Pago — extraída de
 * `src/app/api/webhooks/mercadopago/route.ts` para ser testável em isolamento
 * (Vitest não consegue exercitar um Route Handler diretamente sem subir o
 * Next.js inteiro; funções puras sim).
 *
 * `route.ts` importa e usa estas duas funções — nenhuma mudança de
 * comportamento, só de localização.
 */

export type PaymentStatus = 'pendente' | 'pago' | 'falhou' | 'reembolsado'

// ─── Mapeamento de status MP → status interno ─────────────────────────────────
export function mapMpStatusToPaymentStatus(
  mpStatus: string,
): PaymentStatus | null {
  switch (mpStatus) {
    case 'approved':
      return 'pago'
    case 'pending':
    case 'in_process':
    case 'in_mediation':
    case 'authorized':
      return 'pendente'
    case 'rejected':
    case 'cancelled':
      return 'falhou'
    case 'refunded':
    case 'charged_back':
      return 'reembolsado'
    default:
      return null
  }
}

// ─── Verificação HMAC da assinatura x-signature ───────────────────────────────
// CRÍTICO: data.id deve ser lowercase no manifest — não documentado
// oficialmente pelo Mercado Pago, mas confirmado necessário (caso contrário
// o HMAC nunca bate). Ver HANDOFF/Mapa E-commerce, bloco A5.
export function verifyMpSignature(
  xSignature: string,
  xRequestId: string | null,
  dataId: string,
  secret: string,
): boolean {
  const parts = xSignature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.trim().split('=')
    if (key && value) acc[key.trim()] = value.trim()
    return acc
  }, {})

  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifestParts: string[] = [`id:${dataId.toLowerCase()}`]
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`)
  manifestParts.push(`ts:${ts}`)
  const manifest = manifestParts.join(';') + ';'

  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  // v1 vindo do header pode não ser hex válido (ataque/forjado) — Buffer.from
  // com string ímpar ou caracteres inválidos não lança, mas produz buffer
  // truncado; o length check abaixo cobre o caso comum, e o try/catch cobre
  // entradas que o Node de fato rejeita.
  let receivedBuffer: Buffer
  try {
    receivedBuffer = Buffer.from(v1, 'hex')
  } catch {
    return false
  }

  if (expectedBuffer.length !== receivedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

// Helper só para os testes construírem uma assinatura válida sem duplicar a
// lógica do Mercado Pago real.
export function buildMpSignatureForTesting(
  dataId: string,
  ts: string,
  secret: string,
  xRequestId?: string,
): string {
  const manifestParts: string[] = [`id:${dataId.toLowerCase()}`]
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`)
  manifestParts.push(`ts:${ts}`)
  const manifest = manifestParts.join(';') + ';'
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return `ts=${ts},v1=${v1}`
}
