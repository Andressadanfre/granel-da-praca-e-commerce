export function sanitizeTotpCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

export function isCompleteTotpCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

export function totpQrImageSrc(qrCode: string): string {
  if (qrCode.startsWith('data:')) return qrCode
  return `data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`
}
