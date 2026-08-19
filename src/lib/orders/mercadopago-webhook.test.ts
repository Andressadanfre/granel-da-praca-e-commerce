import { describe, it, expect } from 'vitest'
import {
  verifyMpSignature,
  mapMpStatusToPaymentStatus,
  buildMpSignatureForTesting,
} from './mercadopago-webhook'

const SECRET = 'test-secret-nao-usar-em-producao'
const DATA_ID = 'abc123XYZ'
const REQUEST_ID = 'req-001'
const TS = '1723999999'

// ─── verifyMpSignature — superfície de ataque real: forjar notificação de
// pagamento aprovado sem ter pago de fato ─────────────────────────────────
describe('verifyMpSignature', () => {
  it('aceita assinatura válida construída com o mesmo segredo', () => {
    const sig = buildMpSignatureForTesting(DATA_ID, TS, SECRET, REQUEST_ID)
    expect(verifyMpSignature(sig, REQUEST_ID, DATA_ID, SECRET)).toBe(true)
  })

  it('aceita assinatura válida sem x-request-id (nem todo webhook envia)', () => {
    const sig = buildMpSignatureForTesting(DATA_ID, TS, SECRET)
    expect(verifyMpSignature(sig, null, DATA_ID, SECRET)).toBe(true)
  })

  it('rejeita quando o segredo usado na verificação é diferente do usado na assinatura', () => {
    const sig = buildMpSignatureForTesting(DATA_ID, TS, SECRET, REQUEST_ID)
    expect(verifyMpSignature(sig, REQUEST_ID, DATA_ID, 'segredo-errado')).toBe(false)
  })

  it('rejeita quando o data.id foi alterado após a assinatura ser gerada', () => {
    // Simula um atacante reaproveitando uma assinatura válida de OUTRO
    // pagamento, trocando o data.id na query string.
    const sig = buildMpSignatureForTesting(DATA_ID, TS, SECRET, REQUEST_ID)
    expect(verifyMpSignature(sig, REQUEST_ID, 'outro-payment-id', SECRET)).toBe(false)
  })

  it('rejeita quando o x-request-id não bate com o usado na assinatura', () => {
    const sig = buildMpSignatureForTesting(DATA_ID, TS, SECRET, REQUEST_ID)
    expect(verifyMpSignature(sig, 'request-id-diferente', DATA_ID, SECRET)).toBe(false)
  })

  it('rejeita header sem "ts"', () => {
    expect(verifyMpSignature('v1=abcdef', REQUEST_ID, DATA_ID, SECRET)).toBe(false)
  })

  it('rejeita header sem "v1"', () => {
    expect(verifyMpSignature(`ts=${TS}`, REQUEST_ID, DATA_ID, SECRET)).toBe(false)
  })

  it('rejeita header vazio', () => {
    expect(verifyMpSignature('', REQUEST_ID, DATA_ID, SECRET)).toBe(false)
  })

  it('rejeita v1 forjado com o mesmo tamanho de hash mas valor errado', () => {
    const fakeV1 = 'a'.repeat(64) // sha256 hex = 64 chars, mas não é o hash real
    expect(verifyMpSignature(`ts=${TS},v1=${fakeV1}`, REQUEST_ID, DATA_ID, SECRET)).toBe(false)
  })

  it('rejeita v1 com hex inválido sem lançar exceção (payload malicioso não deve derrubar o endpoint)', () => {
    expect(() =>
      verifyMpSignature(`ts=${TS},v1=not-valid-hex!!`, REQUEST_ID, DATA_ID, SECRET),
    ).not.toThrow()
    expect(verifyMpSignature(`ts=${TS},v1=not-valid-hex!!`, REQUEST_ID, DATA_ID, SECRET)).toBe(false)
  })

  it('data.id é case-insensitive no manifest (comportamento não documentado do MP, mas confirmado necessário)', () => {
    const sig = buildMpSignatureForTesting(DATA_ID.toLowerCase(), TS, SECRET, REQUEST_ID)
    // Verifica com o mesmo dataId em maiúsculas — deve bater, pois a função
    // normaliza para lowercase internamente antes de montar o manifest.
    expect(verifyMpSignature(sig, REQUEST_ID, DATA_ID.toUpperCase(), SECRET)).toBe(true)
  })
})

// ─── mapMpStatusToPaymentStatus ─────────────────────────────────────────────
describe('mapMpStatusToPaymentStatus', () => {
  it('approved → pago', () => {
    expect(mapMpStatusToPaymentStatus('approved')).toBe('pago')
  })

  it.each(['pending', 'in_process', 'in_mediation', 'authorized'])(
    '%s → pendente',
    (status) => {
      expect(mapMpStatusToPaymentStatus(status)).toBe('pendente')
    },
  )

  it.each(['rejected', 'cancelled'])('%s → falhou', (status) => {
    expect(mapMpStatusToPaymentStatus(status)).toBe('falhou')
  })

  it.each(['refunded', 'charged_back'])('%s → reembolsado', (status) => {
    expect(mapMpStatusToPaymentStatus(status)).toBe('reembolsado')
  })

  it('status desconhecido retorna null (webhook ignora, não quebra)', () => {
    expect(mapMpStatusToPaymentStatus('algum_status_novo_do_mp')).toBe(null)
    expect(mapMpStatusToPaymentStatus('')).toBe(null)
  })
})
