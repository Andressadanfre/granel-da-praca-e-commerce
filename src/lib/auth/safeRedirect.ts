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

const ADMIN_MFA_CHALLENGE = '/admin/mfa-challenge'

/**
 * Destino pós-MFA: só paths internos de /admin, nunca a própria tela de challenge.
 * Fallback: /admin.
 */
export function safeAdminRedirect(target: string | null | undefined): string {
  const path = safeRedirect(target)
  if (!path.startsWith('/admin') || path.includes('..')) {
    return '/admin'
  }
  if (
    path === ADMIN_MFA_CHALLENGE ||
    path.startsWith(`${ADMIN_MFA_CHALLENGE}/`) ||
    path.startsWith(`${ADMIN_MFA_CHALLENGE}?`)
  ) {
    return '/admin'
  }
  return path
}
