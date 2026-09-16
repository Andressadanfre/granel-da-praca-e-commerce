import { describe, it, expect } from 'vitest'
import {
  buildFbc,
  extractAttributionFromUrl,
  parseAttributionCookie,
} from './attribution'

describe('extractAttributionFromUrl', () => {
  it('retorna null quando a URL não tem sinal de campanha', () => {
    expect(extractAttributionFromUrl(new URL('https://loja.example/loja'))).toBeNull()
    expect(extractAttributionFromUrl(new URL('https://loja.example/loja?q=castanha'))).toBeNull()
  })

  it('captura gclid e marca canal google_ads mesmo sem UTM', () => {
    const url = new URL('https://loja.example/?gclid=Cj0KCQjwTEST')
    expect(extractAttributionFromUrl(url)).toEqual({
      gclid: 'Cj0KCQjwTEST',
      channel_origin: 'google_ads',
    })
  })

  it('converte fbclid em fbc no formato CAPI do Meta', () => {
    const url = new URL('https://loja.example/?fbclid=IwAR0test')
    const createdAtMs = 1_700_000_000_000
    expect(extractAttributionFromUrl(url, createdAtMs)).toEqual({
      fbc: 'fb.1.1700000000000.IwAR0test',
      channel_origin: 'meta_ads',
    })
  })

  it('usa a taxonomia UTM do projeto (google/cpc e meta/paid_social)', () => {
    const google = new URL(
      'https://loja.example/?utm_source=google&utm_medium=cpc&utm_campaign=fundinho',
    )
    expect(extractAttributionFromUrl(google)).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'fundinho',
      channel_origin: 'google_ads',
    })

    const meta = new URL(
      'https://loja.example/?utm_source=meta&utm_medium=paid_social&utm_campaign=umc',
    )
    expect(extractAttributionFromUrl(meta)).toEqual({
      utm_source: 'meta',
      utm_medium: 'paid_social',
      utm_campaign: 'umc',
      channel_origin: 'meta_ads',
    })
  })

  it('prioriza gclid sobre utm_source para channel_origin', () => {
    const url = new URL(
      'https://loja.example/?gclid=abc&utm_source=meta&utm_medium=paid_social',
    )
    expect(extractAttributionFromUrl(url)?.channel_origin).toBe('google_ads')
  })

  it('descarta caracteres de controle e trunca valores longos', () => {
    const longGclid = `${'A'.repeat(300)}\u0000`
    const url = new URL(`https://loja.example/?gclid=${encodeURIComponent(longGclid)}`)
    const attribution = extractAttributionFromUrl(url)
    expect(attribution?.gclid).toHaveLength(255)
    expect(attribution?.gclid?.includes('\u0000')).toBe(false)
  })
})

describe('buildFbc', () => {
  it('monta fb.1.{timestamp}.{fbclid}', () => {
    expect(buildFbc('IwAR0', 123)).toBe('fb.1.123.IwAR0')
  })
})

describe('parseAttributionCookie', () => {
  it('retorna null para valor ausente, JSON inválido ou payload sem campos', () => {
    expect(parseAttributionCookie(undefined)).toBeNull()
    expect(parseAttributionCookie('{nao-json')).toBeNull()
    expect(parseAttributionCookie('{}')).toBeNull()
    expect(parseAttributionCookie('[]')).toBeNull()
  })

  it('aceita cookie first-touch válido e ignora campos desconhecidos', () => {
    expect(
      parseAttributionCookie(
        JSON.stringify({ gclid: 'abc', foo: 'bar', channel_origin: 'google_ads' }),
      ),
    ).toEqual({
      gclid: 'abc',
      channel_origin: 'google_ads',
    })
  })

  it('rejeita cookie acima do limite de tamanho', () => {
    const huge = JSON.stringify({ gclid: 'A'.repeat(3000) })
    expect(parseAttributionCookie(huge)).toBeNull()
  })
})
