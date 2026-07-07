/**
 * Smoke test E2E — Granel da Praça
 *
 * Pré-requisitos:
 *   - Dev server rodando em http://localhost:3000
 *   - devDependencies: playwright + tsx
 *   - Browser: npx playwright install chromium
 *
 * Execução:
 *   npx tsx scripts/smoke-test.ts
 *
 * Passos cobertos:
 *   1. Homepage carrega (h1 visível)
 *   2. Cada categoria da CategoryBar exibe produtos
 *   3. Adicionar produto ao carrinho abre o CartDrawer (via CartIcon)
 *   4. /checkout renderiza o formulário (Entrega · Identificação · Pagamento)
 *   5. /admin/pedidos sem login redireciona para /conta/login
 */

import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000'
const STEP_TIMEOUT = 15_000

interface StepResult {
  name: string
  ok: boolean
  detail?: string
}

interface CategoryLink {
  label: string
  href: string
}

const results: StepResult[] = []

async function step(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`  [PASS] ${name}`)
  } catch (err) {
    const detail =
      err instanceof Error ? err.message.split('\n')[0] : String(err)
    results.push({ name, ok: false, detail })
    console.log(`  [FAIL] ${name} — ${detail}`)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoriesNav(page: Page) {
  return page.locator('nav[aria-label="Categorias"]')
}

/**
 * Coleta todas as categorias da CategoryBar: as visíveis inline e as que
 * ficam no dropdown "Mais" (só existem no DOM com o dropdown aberto).
 */
async function collectCategories(page: Page): Promise<CategoryLink[]> {
  const nav = categoriesNav(page)
  await nav.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })

  const inline = nav.locator('a[href*="categoria="]')
  await inline.first().waitFor({ state: 'visible', timeout: STEP_TIMEOUT })

  const links: CategoryLink[] = []
  for (const el of await inline.all()) {
    const href = await el.getAttribute('href')
    const label = (await el.innerText()).trim()
    if (href && label) links.push({ label, href })
  }

  const maisButton = nav.getByRole('button', { name: 'Mais' })
  if (await maisButton.isVisible()) {
    await maisButton.click()
    const menu = page.getByRole('menu')
    await menu.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
    for (const el of await menu.getByRole('menuitem').all()) {
      const href = await el.getAttribute('href')
      const label = (await el.innerText()).trim()
      if (href && label) links.push({ label, href })
    }
    await page.keyboard.press('Escape')
    await page.locator('body').click({ position: { x: 5, y: 5 } })
  }

  return links
}

/**
 * Clica na categoria pela CategoryBar (inline ou via dropdown "Mais")
 * e aguarda a navegação para /loja?categoria=…
 */
async function clickCategory(page: Page, cat: CategoryLink): Promise<void> {
  const nav = categoriesNav(page)
  const inlineLink = nav.locator(`a[href="${cat.href}"]`)

  if ((await inlineLink.count()) > 0 && (await inlineLink.first().isVisible())) {
    await inlineLink.first().click()
  } else {
    await nav.getByRole('button', { name: 'Mais' }).click()
    const menuItem = page.getByRole('menuitem', { name: cat.label, exact: true })
    await menuItem.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
    await menuItem.click()
  }

  await page.waitForURL((url) => url.href.includes('categoria='), {
    timeout: STEP_TIMEOUT,
  })
}

async function expectProductsVisible(page: Page): Promise<void> {
  await page
    .locator('[data-product-id]')
    .first()
    .waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
}

// ─── Suite ────────────────────────────────────────────────────────────────────

async function run(browser: Browser): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    locale: 'pt-BR',
  })
  const page = await context.newPage()
  page.setDefaultTimeout(STEP_TIMEOUT)

  // 1 — Homepage
  await step('Homepage carrega (h1 visível)', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await page
      .locator('h1')
      .first()
      .waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
  })

  // 2 — Categorias da CategoryBar
  let categories: CategoryLink[] = []
  await step('CategoryBar renderiza categorias', async () => {
    categories = await collectCategories(page)
    if (categories.length === 0) {
      throw new Error('Nenhuma categoria encontrada na CategoryBar')
    }
    console.log(`         ${categories.length} categorias encontradas`)
  })

  for (const cat of categories) {
    await step(`Categoria "${cat.label}" exibe produtos`, async () => {
      await clickCategory(page, cat)
      await expectProductsVisible(page)
    })
  }

  // 3 — Add to cart + CartDrawer
  await step('Adicionar produto abre o CartDrawer', async () => {
    await page.goto(`${BASE_URL}/loja`, { waitUntil: 'domcontentloaded' })
    await expectProductsVisible(page)

    await page.getByRole('button', { name: '+ Adicionar' }).first().click()

    // O drawer não abre sozinho — abre pelo clique no CartIcon
    await page.getByRole('button', { name: /^Carrinho com/ }).click()

    const drawer = page.getByRole('dialog', { name: 'Carrinho de compras' })
    await drawer.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })

    const badge = drawer.getByText(/1 produto/)
    await badge.waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
  })

  // 4 — Checkout (carrinho já tem 1 item no localStorage deste contexto)
  await step('/checkout renderiza o formulário', async () => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded' })
    for (const heading of ['Entrega', 'Identificação', 'Pagamento']) {
      await page
        .getByRole('heading', { name: heading, exact: true })
        .waitFor({ state: 'visible', timeout: STEP_TIMEOUT })
    }
  })

  // 5 — /admin/pedidos sem login → redirect para /conta/login
  await step('/admin/pedidos sem login redireciona para /conta/login', async () => {
    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL((url) => url.pathname.startsWith('/conta/login'), {
      timeout: STEP_TIMEOUT,
    })
  })

  await context.close()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nSmoke test — ${BASE_URL}\n`)

  const browser = await chromium.launch()
  try {
    await run(browser)
  } finally {
    await browser.close()
  }

  const passed = results.filter((r) => r.ok)
  const failed = results.filter((r) => !r.ok)

  console.log('\n─── Resumo ───────────────────────────────')
  console.log(`  Passaram: ${passed.length}/${results.length}`)
  if (failed.length > 0) {
    console.log(`  Falharam: ${failed.length}`)
    for (const f of failed) {
      console.log(`    ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`)
    }
  }
  console.log('──────────────────────────────────────────\n')

  process.exitCode = failed.length > 0 ? 1 : 0
}

main().catch((err: unknown) => {
  console.error('Erro fatal no smoke test:', err)
  process.exitCode = 1
})
