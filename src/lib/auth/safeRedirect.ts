/**
 * Evita open redirect: aceita apenas paths internos relativos.
 * Fallback: Home (/).
 */
export function safeRedirect(target: string | null | undefined): string {
  if (
    target &&
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.includes('://')
  ) {
    return target
  }
  return '/'
}
