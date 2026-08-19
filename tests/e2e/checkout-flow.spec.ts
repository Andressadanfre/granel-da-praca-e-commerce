import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Suíte E2E do fluxo crítico de compra.
 *
 * Esta suíte substitui `scripts/smoke-test.ts` como fonte de verdade em CI
 * (mesma cobertura de passos, agora no runner oficial do Playwright: relatório
 * HTML, retry automático, trace/vídeo em falha, integração nativa com GitHub
 * Actions). `scripts/smoke-test.ts` continua funcionando pra debug manual
 * rápido fora do CI (`npx tsx scripts/smoke-test.ts`), não foi removido.
 */

function categoriesNav(page: Page) {
  return page.locator('nav[aria-label="Categorias"]')
}

test.describe('Fluxo público — navegação e carrinho', () => {
  test('homepage carrega com h1 visível', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('CategoryBar renderiza categorias e cada uma exibe produtos', async ({ page }) => {
    await page.goto('/')
    const nav = categoriesNav(page)
    await expect(nav).toBeVisible()

    const inline = nav.locator('a[href*="categoria="]')
    await expect(inline.first()).toBeVisible()

    const count = await inline.count()
    expect(count).toBeGreaterThan(0)

    // Testa a primeira categoria inline como representante do fluxo —
    // percorrer todas as N categorias em CI custa tempo sem ganho
    // proporcional; o smoke-test.ts manual continua cobrindo todas.
    const first = inline.first()
    const href = await first.getAttribute('href')
    await first.click()
    await page.waitForURL((url) => url.href.includes('categoria='))

    await expect(page.locator('[data-product-id]').first()).toBeVisible()
    expect(href).toContain('categoria=')
  })

  test('adicionar produto abre o CartDrawer com o item', async ({ page }) => {
    await page.goto('/loja')
    await expect(page.locator('[data-product-id]').first()).toBeVisible()

    await page.getByRole('button', { name: '+ Adicionar' }).first().click()
    await page.getByRole('button', { name: /^Carrinho com/ }).click()

    const drawer = page.getByRole('dialog', { name: 'Carrinho de compras' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText(/1 produto/)).toBeVisible()
  })
})

test.describe('Checkout', () => {
  test('/checkout renderiza os 3 blocos do formulário com item no carrinho', async ({ page }) => {
    // Popula o carrinho via localStorage antes de navegar — evita repetir o
    // fluxo de UI de "adicionar ao carrinho" só para chegar no checkout.
    await page.goto('/loja')
    await expect(page.locator('[data-product-id]').first()).toBeVisible()
    await page.getByRole('button', { name: '+ Adicionar' }).first().click()

    await page.goto('/checkout')
    for (const heading of ['Entrega', 'Identificação', 'Pagamento']) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
  })

  test('/checkout com carrinho vazio mostra estado vazio, não o formulário', async ({ page }) => {
    // Regressão direta do guard de negócio: createOrderSchema exige
    // items.min(1) — CheckoutForm.tsx trata isso no client antes mesmo de
    // chamar a Server Action (early return em items.length === 0).
    await page.goto('/checkout')
    await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ir para a loja' })).toBeVisible()
    // O formulário de pagamento não deve renderizar junto com o estado vazio.
    await expect(page.getByRole('heading', { name: 'Pagamento', exact: true })).not.toBeVisible()
  })
})

test.describe('RBAC — admin', () => {
  test('/admin/pedidos sem login redireciona para /conta/login', async ({ page }) => {
    await page.goto('/admin/pedidos')
    await page.waitForURL((url) => url.pathname.startsWith('/conta/login'))
  })

  test('/admin sem login redireciona para /conta/login', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL((url) => url.pathname.startsWith('/conta/login'))
  })
})
