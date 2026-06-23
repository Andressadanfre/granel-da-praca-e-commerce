# CLAUDE.md — Granel da Praça E-commerce

> Lido automaticamente pelo Claude Code a cada sessão.
> Fonte de verdade para decisões de arquitetura e estilo.
> Atualizado em 11/05/2026 · Sessões 031–046.

---

## Stack

| Tecnologia | Versão | Regra |
|---|---|---|
| Next.js | 14.2.x | App Router — **nunca** Pages Router |
| Tailwind CSS | v3.4.x | **nunca** v4 |
| TypeScript | strict | zero `any`, `as any`, `@ts-ignore` |
| Supabase | `@supabase/ssr` | **nunca** `auth-helpers-nextjs` |
| Framer Motion | v12 | `ease` como `[n,n,n,n]` tuple — nunca `number[]` |

Design system próprio — **sem** shadcn/ui.

---

## Design Tokens (DS v3.1)

Todos os tokens estão mapeados em `tailwind.config.ts`. Nunca usar hex hardcoded.

### Cores

```text
Verdes da marca
  g         #00B207   CTA conversão: "Finalizar compra" · "Buscar" · "Confirmar pedido"
  gd        #2C742F   Add-to-cart nos cards do catálogo — NUNCA #00B207 aqui
  gdeep     #002603   TopBar · preços · logo · fundos escuros
  ghover    #1A5C1E   Hover único de todos os CTAs
  g-muted   #F1F8E9   Hover botão secondary
  g-light   #E8F5E9   Eyebrow pill HeroBanner · ícones leves

Backgrounds
  cream       #F9F5EF   Background geral — NUNCA branco puro (#fff)
  cream-img   #F0EBE2   Fundo da área de imagem no ProductCard
  surface     #F9FAFB   Fundo de cards e inputs

Texto
  t9   #111827   Primário
  t7   #374151   Preço/kg — contraste 9.2:1 AAA
  t6   #4B5563   Suporte
  t5   #6B7280   Preço riscado — contraste 5.74:1 AA
  t4   #9CA3AF   Labels muted · placeholder

Bordas
  bd   #E5E7EB   Bordas padrão

Badges e estados
  promo          #C0694A   Terracota — NUNCA #E65100
  promo-bg       #FBF1EE
  indigo         #3730A3   Badge "Por unidade"
  indigo-bg      #EEF2FF
  danger         #EF4444   Estoque crítico · erros
  badge-diet-bg  #EAF7EA
  badge-diet-tx  #2C742F
  badge-diet-bd  #C6E6C7
  icon-bg        #F0FDF4
  warning-bg     #FEF3C7
  warning-text   #92400E
  lime           #D4F567   Ofertas
```

### Border-radius

| Classe Tailwind | Valor | Uso |
|---|---|---|
| `rounded-input` | 8px | Inputs |
| `rounded-sel` | 10px | QuantitySelector pill |
| `rounded-inner` | 12px | Painéis e badges flutuantes |
| `rounded-modal` | 16px | Modais e drawers |
| `rounded-card` | 20px | ProductCard |
| `rounded-pill` | 100px | Badges · dots · pills |

### Shadows

| Classe | Uso |
|---|---|
| `shadow-card` | ProductCard padrão |
| `shadow-card-hover` | ProductCard ao hover |
| `shadow-drawer` | MobileNavDrawer |
| `shadow-nav` | Navigation bar |

### Regras gerais de estilo
- `stroke-width` em todos os SVGs: **1.6**
- Unidade de peso: **`gr`** — nunca `g`, `g.`, `gram`
- Background geral: `bg-cream` — nunca `bg-white`

---

## Supabase — Schema Real (confirmado Sessão 036, re-auditado via MCP em 18/06/2026)

> **Este schema é a fonte de verdade.** Sempre verificar aqui antes de escrever qualquer query.

### Projeto
- **ID:** `ymjmgukuojwumvtaglyp` · **Região:** São Paulo
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`

### `categories`

```sql
id          integer      PK  ← serial, NÃO uuid
name        text         NOT NULL
slug        text         NOT NULL UNIQUE
description text
icon_name   text         ← NÃO icon_url, NÃO image_url (não existem nesta tabela)
sort_order  smallint     NOT NULL DEFAULT 0  ← usa sort_order, NÃO display_order
is_active   boolean      NOT NULL DEFAULT true  ← usa is_active, NÃO is_deleted (não existe aqui)
created_at  timestamptz  NOT NULL
updated_at  timestamptz  NOT NULL
```

### `products`

```sql
id               integer     PK  ← serial, NÃO uuid
name             text        NOT NULL
slug             text        NOT NULL UNIQUE
description      text
category_id      integer     NOT NULL  FK → categories.id  ← NÃO nullable, NÃO uuid
product_type     enum        ('granel', 'unit')
price_cents      int         NOT NULL   ← preço por kg em centavos
increment_grams  int         NOT NULL DEFAULT 100  ← step do QuantitySelector APENAS
compare_at_cents int                    ← preço original p/ desconto
unit             enum        ('KG','UN','SC','CX','BL')
stock_status     text        NOT NULL DEFAULT 'in_stock'
is_active        boolean     NOT NULL DEFAULT true
is_featured      boolean     NOT NULL DEFAULT false
is_deleted       boolean     NOT NULL DEFAULT false  ← soft delete (EXISTS aqui)
created_at       timestamptz NOT NULL
updated_at       timestamptz NOT NULL
```

> ❌ **NÃO EXISTE** `image_url` em `products` — nunca existiu. Fotos ficam em `product_images`.
> ❌ **NÃO EXISTE** `price_per_100g_cents` — nunca usar em queries.
> ✅ **Cálculo granel:** `Math.round(price_cents / 10)` = preço por 100gr · `price_cents` = preço por kg
> ✅ `increment_grams` é APENAS o step do QuantitySelector (100 granel / 1 unit) — NUNCA divisor de preço

### `product_images`

```sql
id          integer     PK  ← serial
product_id  integer     NOT NULL  FK → products.id
url         text        NOT NULL
alt         text
sort_order  smallint    NOT NULL DEFAULT 0
is_primary  boolean     NOT NULL DEFAULT false
created_at  timestamptz NOT NULL
```

> Helper: `pickPrimaryImage(images)` em `src/lib/utils.ts` — retorna `url` da imagem com `is_primary = true`, ou a primeira, ou `null` se vazio.

### `app_users`

Tabela de usuários da aplicação — **nunca** `profiles`.

### `newsletter_subscriptions`

```sql
id          uuid  PK
email       text  NOT NULL UNIQUE
created_at  timestamptz
```

### Regras Supabase

- **Nunca** instanciar client no top-level — sempre via função
- Soft delete: `is_deleted = true` em `products` — **nunca** `DELETE` físico
- Datas: `YYYY-MM-DD` no banco · `DD/MM/AAAA` na UI
- Monetário: centavos (`int`) no banco · `formatBRL(cents)` na UI

### Helpers — `src/lib/supabase/`

```typescript
// Server Components, Server Actions, Route Handlers (RLS via cookies)
import { getSupabaseServer } from '@/lib/supabase/server'

// Client Components ('use client') com ANON_KEY + RLS ativo
import { getSupabase } from '@/lib/supabase/client'

// Admin — bypass de RLS — NUNCA importar em Client Components
import { getSupabaseAdmin } from '@/lib/supabase/server'
```

---


## Seguranca de Negocio

### Calculo de preco
- Server Action recebe apenas product_id e quantity_grams
- Preco SEMPRE buscado do banco
- Total (centavos): price_cents * quantity_grams / 1000

### IDs publicos
- orders, payments: UUID obrigatorio
- Nunca int sequencial em URL

### Idempotencia
- Checkout usa cart_id como idempotency_key

### Cupons Race Condition
- UPDATE com RETURNING e WHERE used_count < max_uses em query unica

### IDOR
- Queries em orders filtram por user_id da sessao

### Rate limiting
- checkout: 5 req/min
- auth: 10 req/min
- coupons: 3 req/min

## 🛡️ Segurança Web — Regras Absolutas

### Headers HTTP obrigatórios (adicionar em `next.config.js` antes do lançamento)
```typescript
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co" },
  ],
}]
```

### XSS
- **Proibido** `dangerouslySetInnerHTML` sem sanitização — instalar `isomorphic-dompurify` antes de qualquer uso
- React escapa automaticamente `{variavel}` em JSX — nunca contornar isso com HTML bruto

### CSRF
- Server Actions do Next.js 14 têm proteção nativa de origin — mas mutações autenticadas **ainda exigem** validação de sessão, autorização e origem esperada
- Cookies de sessão: `httpOnly; Secure; SameSite=Strict`
- **Nunca** usar Route Handlers para mutações autenticadas — usar Server Actions

### Open Redirect
- **Proibido** `redirect(params.url)` — sempre usar paths internos fixos

### Upload de arquivos (admin futuro)
- Aceitar apenas: `jpg`, `jpeg`, `png`, `webp` — máx 5MB
- Validar MIME type no servidor — nunca confiar no `Content-Type` do cliente

### Autenticação — Identity no Servidor
- **Nunca** confiar em `user_id` enviado pelo cliente como parâmetro
- **Sempre** obter identidade via:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autorizado' }
  ```
- Toda query de mutação ou leitura sensível **deve** incluir `.eq('user_id', user.id)`

### Autorização — RBAC
| Ação | customer | admin |
|---|---|---|
| Ver próprio pedido | ✅ | ✅ |
| Ver pedido de terceiros | ❌ | ✅ |
| Alterar produto/estoque | ❌ | ✅ |
| Aplicar cupom | ✅ | ✅ |

## 🚨 Error Handling — Padrão Único

### Server Actions — retornar resultado tipado, nunca lançar erro bruto
```typescript
// ❌ ERRADO — expõe stack trace e mensagens internas na UI
throw new Error(error.message)

// ✅ CERTO — resultado tipado, mensagem amigável
return { success: false, error: 'Não foi possível completar a operação.' }
return { success: true, data: resultado }
```

### Route Handlers — lançar e capturar na camada superior
```typescript
// ✅ CERTO — capturar e retornar genérico
try {
  const data = await fetchData()
  return NextResponse.json({ success: true, data })
} catch (error) {
  logger.error('Erro interno', error)
  return NextResponse.json({ success: false, error: 'Erro interno.' }, { status: 500 })
}
```

### Regras absolutas
- Nunca expor `error.message`, `error.stack` ou mensagem do banco na resposta ao cliente
- Erros internos: sempre logar via `logger.error()` de `src/lib/logger.ts`
- Tipos de erro a implementar na Fase 5: `AppError`, `ValidationError`, `AuthError`, `DatabaseError`

## 🔄 Cache e Revalidação — Princípios

### Quando usar cada estratégia
| Situação | Estratégia | Como declarar |
|---|---|---|
| Rota lê `searchParams` ou `cookies()` explicitamente | SSR dinâmico | `export const dynamic = 'force-dynamic'` |
| Rota pública sem filtros dinâmicos | ISR | `export const revalidate = N` (segundos) |
| Rota de admin com mutações | SSR dinâmico | `export const dynamic = 'force-dynamic'` |

### Revalidação após mutações (Fase 5)
```typescript
import { revalidatePath } from 'next/cache'
// Chamar ao final de Server Actions que alteram dados públicos
revalidatePath('/loja')
revalidatePath(`/loja/${categoria}/${slug}`)
```

### Query dupla — deduplicar com `cache()` do React
```typescript
// Obrigatório quando generateMetadata e Page Component usam a mesma query
import { cache } from 'react'
const getCachedProduct = cache(getProductDetail)
// Ambos chamam getCachedProduct — apenas 1 query por requisição
```

> Decisões específicas de renderização por rota estão em `docs/adr/`.

## 💧 localStorage e Hidratação

### Princípio
Server Components são a padrão. `localStorage` só é acessível no cliente — usar com parcimônia.

### Quando usar `isMounted` (exceção, não regra)
Apenas quando o componente depende **exclusivamente** de browser APIs e não pode ser Server Component:
```typescript
// Usar apenas para componentes 100% dependentes de browser (ex: badge do carrinho)
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])
if (!isMounted) return <CartIconSkeleton /> // skeleton, nunca null em elemento LCP
```

### Alternativa preferida — desabilitar SSR cirurgicamente
```typescript
// Para subcomponentes isolados que não afetam LCP ou SEO
import dynamic from 'next/dynamic'
const CartBadge = dynamic(() => import('./CartBadge'), { ssr: false })
```

### Sincronização entre abas
- Mesma aba: `window.dispatchEvent(new CustomEvent('cart:updated', { detail: count }))`
- Outra aba: ouvir evento `'storage'` do browser

## 📦 Regras de Negócio

### Produto granel
- Incremento mínimo: 100 gr · sem teto máximo fixo
- Conversão automática: ≥ 1000 gr → kg com vírgula BR (`1 kg`, `1,5 kg`)
- Preço exibido por 100 gr: `Math.round(price_cents / 10)` · preço por kg: `price_cents` direto

### Estoque
- `in_stock` → venda normal
- `low_stock` → badge "Últimas unidades" · venda permitida
- `out_of_stock` → botão desabilitado · sem adição ao carrinho
- **Proibido** estoque negativo — validar no servidor antes de confirmar pedido

### Preço durante checkout
- Preço **sempre** relido do banco no momento do checkout — nunca confiar no valor enviado pelo cliente
- Se preço foi alterado entre adição ao carrinho e checkout → notificar usuário antes de confirmar

### Pedido duplicado
- Usar `cart_id` como `idempotency_key` — mesma chave nunca cria dois pedidos

### Cupom
- Validar no servidor: ativo, dentro do prazo, `used_count < max_uses`
- Decremento atômico via RPC — nunca dois requests simultâneos consumindo o mesmo cupom

### Produto inativo ou deletado
- `is_active = false` ou `is_deleted = true` → `notFound()` em qualquer rota do produto
- Nunca aparecer em listagens ou resultados de busca

### Frete
- R$ 15,00 fixo · grátis para pedidos ≥ R$ 100,00
- Calculado exclusivamente no servidor — nunca no cliente

### Parcelamento
- 2x sem juros a partir de R$ 150,00
- 3x sem juros a partir de R$ 300,00

### PIX
- 5% de desconto — aplicado no servidor

### Programa de Fidelidade — Carimbo Digital
- 1 ponto a cada R$ 50,00 em compras (qualquer forma de pagamento)
- 10 pontos = R$ 15,00 de desconto automático no próximo pedido
- Carimbo digital visual em `/conta/fidelidade` — 10 espaços preenchíveis
- Expiração: 12 meses sem atividade
- Não combinável com desconto de 1ª compra nem outros cupons
- Desconto de 1ª compra: 10% automático na primeira compra ≥ R$ 150,00 — sem cupom

## 🤖 Regras para IA — Claude/Cursor

### Proibido sem aprovação explícita
- Criar ou alterar arquivos em `supabase/migrations/`
- Executar SQL destrutivo: `DELETE`, `DROP`, `TRUNCATE`
- `UPDATE` sem cláusula `WHERE`
- `DELETE` sem cláusula `WHERE`
- Reescrever arquivos inteiros — apenas snippets alterados
- Commitar sem build limpo (`npm run build 2>&1` zero erros)
- Instalar novas dependências sem mencionar explicitamente
- Criar variantes do `Badge` além das 6 existentes: `diet`, `promo`, `unit`, `discount`, `low-stock`, `featured`

### Obrigatório antes de qualquer alteração
1. Ler este `CLAUDE.md`
2. Ler o(s) arquivo(s) alvo em disco — nunca editar de memória
3. Verificar schema Supabase (seção acima) antes de escrever query
4. Verificar `tailwind.config.ts` antes de escolher classe de cor
5. Mostrar diff para aprovação antes de `git add`

### Proibido inventar
- Campos inexistentes no schema: `price_per_100g_cents`, `is_deleted` em `categories`, `image_url` em `products`
- Caminhos de import não confirmados em disco
- Comportamentos de negócio não documentados na seção "Regras de Negócio"

### Pendências de arquitetura — não alterar sem sessão dedicada

Identificadas no code review de 18/06/2026. Aguardam sessão de auditoria
própria pós-fix do bug `image_url`. **Não corrigir espontaneamente** —
não misturar com outro fix em andamento.

- **`Badge.tsx`**: usa `style={{}}` + `src/lib/tokens.ts` em vez de classe
  Tailwind. Não adicionar novos `style={{}}` com valores de `tokens.ts` —
  padrão correto é classe Tailwind, igual ao resto do DS.
- **`CartDrawer.tsx`**: lista de itens usa `<div>` por item em vez de
  `<ul>/<li>`. Não adicionar novos `<div>` por item na lista.
- **`ProductGrid.tsx`**: mistura query Supabase, normalização e paginação
  no mesmo arquivo. Não adicionar lógica de fetch ou normalização aqui —
  extração para `src/lib/products/` agendada pós-fix, em commit separado.

## 📊 Observabilidade

### Logging estruturado — pino instalado (Sessão 045)
- `src/lib/logger.ts` funcional — usar `logger.info()`, `logger.warn()`, `logger.error()`
- **Nunca** `console.log/error/warn` em código commitado
- `src/lib/sanitizeForLog.ts` — mascarar dados sensíveis antes de logar (LGPD)

### Campos obrigatórios em todo log
```typescript
logger.info('Descrição do evento', {
  request_id: ctx.requestId,   // sempre
  user_id: user?.id,           // quando autenticado
  route: '/api/...',           // rota ou action
  // nunca: senha, token, CPF, cartão, session
})
```

### Audit log — admin (Fase 6)
Toda alteração de produto, preço, estoque ou cupom deve gerar registro:
```typescript
// quem · o quê · quando · valor anterior · valor novo
await supabase.from('audit_logs').insert({ user_id, action, entity, old_value, new_value })
```

### Monitoramento de erros (pendente — pré-lançamento)
- Instalar Sentry (`@sentry/nextjs`) antes do lançamento
- Capturar: exceptions, hydration errors, Server Action errors, erros de API
- Nunca logar: senha, token, CPF, número de cartão, dados de sessão

### Health check existente
- `GET /api/health` → verifica conexão Supabase · retorna `{ status: 'ok' | 'error' }`

## ⚡ Performance — Budget

### Core Web Vitals (metas para e-commerce)
| Métrica | Meta | O que mede |
|---|---|---|
| LCP | < 2.5s | Maior elemento visível carregado |
| CLS | < 0.1 | Estabilidade visual — sem layout shift |
| INP | < 200ms | Resposta a interações do usuário |

### Bundle budget
- JS inicial (First Load JS): **< 250kb gzip**
- Verificar após cada sessão: `npm run build` mostra o tamanho por rota
- Lazy loading obrigatório para: modais, drawers, admin, componentes pesados

### Lazy loading — padrão
```typescript
// Componentes pesados ou raramente visíveis
const CartDrawer = dynamic(() => import('./CartDrawer'))
const AdminSidebar = dynamic(() => import('./AdminSidebar'))
```

### Imagens
- `next/image` obrigatório — nunca `<img>` puro
- Formato: WebP · AVIF quando possível
- `priority` apenas no elemento LCP (primeira imagem acima da dobra)
- `sizes` descritivo obrigatório em todo `fill`

## 🔍 SEO — Obrigatório em Rotas Públicas

### generateMetadata — obrigatório em toda rota pública
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${produto.name} | Granel da Praça`,
    description: produto.description?.slice(0, 155) ?? `Compre ${produto.name} a granel`,
    openGraph: {
      title: `${produto.name} | Granel da Praça`,
      images: produto.image_url ? [produto.image_url] : [],
    },
    alternates: { canonical: `/loja/${categoria}/${slug}` },
  }
}
```

### Schema.org (pendente — pré-lançamento)
- `Product` em cada PDP
- `BreadcrumbList` em páginas de categoria e PDP
- `Organization` no layout raiz

## 🧪 Testes — Estratégia (pendente — pré-lançamento)

| Camada | Framework | Escopo |
|---|---|---|
| Unitário | Vitest | `formatBRL`, `formatGrams`, cálculos de preço granel, helpers |
| Integração | Vitest | Server Actions, queries Supabase, validações Zod |
| E2E | Playwright | Fluxo completo: produto → carrinho → checkout → confirmação |

### Cobertura mínima
- Funções utilitárias e cálculos de preço: **100%**
- Server Actions críticas (checkout, newsletter): **80%**
- Fluxo E2E principal: **obrigatório antes de qualquer lançamento**

## 🚀 CI/CD — Pipeline (pendente — pré-lançamento)

```yaml
# .github/workflows/ci.yml — executar em todo PR e push para master
steps:
  - lint       # eslint
  - typecheck  # tsc --noEmit
  - build      # npm run build
  - test       # vitest
  - e2e        # playwright (apenas em merge para master)
```

**Regra:** merge bloqueado se qualquer step falhar.

## Padrões de Código

### Ordem de imports

```typescript
// 1. React / framework
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 2. Libs externas
import { motion } from 'framer-motion'

// 3. Componentes internos
import { Badge } from '@/components/ui/Badge'

// 4. Tipos
import type { ProductCardProps } from '@/components/product/ProductCard'

// 5. Utils
import { cn, formatBRL } from '@/lib/utils'
```

### Estilos — regra absoluta

```tsx
// ❌ ERRADO — style inline estático
<div style={{ display: 'flex', alignItems: 'center', width: '40px', height: '40px' }} />

// ✅ CERTO — classes Tailwind
<div className="flex items-center w-10 h-10" />

// ✅ ÚNICO uso legítimo de style — valor dinâmico em runtime
<div style={{ width: `${progress}%` }} />  // vem de estado ou API
```

### Classes condicionais

```tsx
// ❌ ERRADO
className={['flex', condition && 'border-l'].filter(Boolean).join(' ')}

// ✅ CERTO — sempre cn() de @/lib/utils
className={cn('flex', condition && 'border-l')}
```

### Valores arbitrários Tailwind

```tsx
// ❌ ERRADO — arbitrário quando existe escala padrão
className="text-[14px]"  // → text-sm
className="text-[12px]"  // → text-xs

// ✅ CERTO — arbitrário apenas sem equivalente na escala
className="text-[13.5px]"
className="h-[200px]"
```

### Cores

```tsx
// ❌ ERRADO
style={{ color: '#6B7280' }}
className="text-[#6B7280]"

// ✅ CERTO — token semântico
className="text-t5"

// ✅ PERMITIDO — hex sem token, com constante documentada
// Cores da marca Google em UserMenuPopover.tsx — identidade externa, não do DS
const GOOGLE_BRAND_RED = '#EA4335'
```

### Tipagem

```tsx
// ❌ ERRADO
data as unknown as ProductRow[]
(data: any)

// ✅ CERTO
type ProductWithCategory = Tables<'products'> & { categories: { name: string } | null }
```

### Fronteira Server / Client

```tsx
// ❌ ERRADO — 'use client' desnecessário
'use client'
export function Title() { return <h1>Olá</h1> }

// ✅ CERTO — Server Component por padrão
export function Title() { return <h1>Olá</h1> }

// 'use client' APENAS para: useState · useEffect · event handlers · hooks de browser
```

### Border CSS

```tsx
// ❌ ERRADO — mistura Tailwind com style inline
className="border-t-2 border-l-2" style={{ borderBottom: '2px solid #E5E7EB' }}

// ✅ CERTO — tudo via Tailwind
className="border-b-2 border-b-bd"
```

### Entrega de código

```tsx
// ❌ ERRADO — reescrever o arquivo inteiro
// ✅ CERTO — snippet com contexto + // ... para trechos não alterados
```

---

## Arquitetura de Componentes

### QuantitySelector

- Idle: botão `+ Adicionar` · full-width · `h-10` · `bg-gd`
- Active: pill `[− | 100 gr | +]` · grid `1fr 2fr 1fr` · `px-3`
- Display central: só quantidade, **sem preço**
- Incremento granel: `100 gr` | Unidade: `1 un.`

### Cart

- localStorage key: `'granel:cart_count'`
- Eventos: `'storage'` (cross-tab) + `'cart:updated'` (same-tab)
- Atualizar badge do CartIcon:
  ```ts
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: novoCount }))
  ```

### SearchBar

- Navega para `/loja?q=` via `router.push(encodeURIComponent(termo))`

### HeroBanner / HeroSlider

- `HeroBanner.tsx` → Server Component — **não adicionar** hooks nem handlers aqui
- `HeroSlider.tsx` → Client Component — editar só o array `SLIDES` para novos slides
- Imagens em `public/images/hero/hero-0{1,2,3}.webp`
- Framer Motion: `ease` como `[n, n, n, n]` tuple tipada — **nunca** `number[]`

---

## Funções Utilitárias — `src/lib/utils.ts`

| Função | Uso |
|---|---|
| `cn(...inputs)` | clsx + tailwind-merge para classes condicionais |
| `formatBRL(cents)` | centavos → `"R$ X,XX"` |
| `formatGrams(grams)` | gramas → `"XXX gr"` (unidade `gr`, não `g`) |

Funções puras sempre **fora** do componente (topo do arquivo ou em `utils.ts`).

---

## Fluxo de Trabalho Claude Code

### Antes de qualquer ação

1. **Ler** os arquivos relevantes antes de propor código — nunca editar de memória
2. **Schema Supabase:** verificar seção acima antes de escrever qualquer query
3. **Tokens de cor:** verificar `tailwind.config.ts` antes de escolher classe

### Fluxo iterativo (padrão deste projeto)

```
Ler arquivo(s) → Diagnóstico → Aguardar aprovação → Código → Build → Commit
```

- **Nunca pular etapas** sem confirmação explícita da usuária
- **Nunca reescrever arquivos inteiros** — apenas snippets alterados
- Mostrar `git diff --staged --stat` antes de todo commit
- Executar `npm run build 2>&1` antes de todo commit — **zero erros TypeScript**

### Commits

```
Formato:  tipo(escopo): descrição em português
Autor:    Andressadanfre
Tipos:    feat · fix · refactor · chore · docs
Exemplo:  feat(loja): adicionar filtro por categoria com URL state
```

Nunca commitar com build quebrado.

### PowerShell

- Terminal: PowerShell 5.1 — nunca bash/sh
- Encadeamento: `A; if ($?) { B }` — `&&` não existe no PS 5.1
- Cache corrompido após criar arquivo: `npm run build:clean`
- Dev server travado: `taskkill /F /IM node.exe` → `Remove-Item -Recurse -Force .next` → `npm run dev`

---

## Checklist de Autoauditoria — Antes de Todo Commit

### Código geral
- [ ] Zero `console.log/error/warn` — `Select-String -r "console\." src/`
- [ ] Zero `as any`, `as unknown as` — `Select-String "as any" src/`
- [ ] Zero `@ts-ignore`, `@ts-expect-error` sem comentário explicando
- [ ] Zero `style` prop com valor estático (migrado para classes Tailwind)
- [ ] Todas as classes condicionais usam `cn()` — zero `.filter(Boolean).join(' ')`
- [ ] Nenhum hex hardcoded novo fora de `tailwind.config.ts`

### Supabase
- [ ] Nenhuma query usa `price_per_100g_cents` (não existe)
- [ ] Nenhuma query usa `is_deleted` em `categories` (não existe na tabela)
- [ ] Nenhum `getSupabaseAdmin()` importado em arquivo `'use client'`
- [ ] Soft delete usa `is_deleted = true` — nunca `DELETE FROM`

### Next.js / Tailwind
- [ ] `'use client'` só existe onde há `useState`/`useEffect`/event handlers
- [ ] `next/image` em todas as imagens — zero `<img>` puro
- [ ] Sem classes conflitantes no mesmo elemento (`font-semibold` + `font-bold` etc.)
- [ ] Sem `border` shorthand misturado com `style={{ border... }}`

### Git
- [ ] `npm run build 2>&1` → zero erros · zero warnings TypeScript
- [ ] `git diff --staged --stat` → apenas os arquivos esperados estão no stage

---

## Estado do Projeto — 18/06/2026 · Sessão 050 · HEAD 78b119e

### Infraestrutura
- **Repo:** `github.com/Andressadanfre/granel-da-praca-e-commerce`
- **Pasta:** `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce`
- **Supabase:** `ymjmgukuojwumvtaglyp` · São Paulo · 402 produtos · 11 categorias
- **Build:** ✅ limpo
- **Auditoria 20/05/2026:** ✅ 100% concluída (Blocos 1–9)

### Rotas

| Rota | Status |
|---|---|
| `/` | ✅ Homepage completa |
| `/loja` | ✅ Implementada |
| `/loja/[categoria]/[slug]` | ✅ Implementada · Sessão 046 |
| `/carrinho` | ✅ Removida — substituída pelo `CartDrawer` (overlay). Nunca existirá como página separada. |
| `/checkout` | 🔴 Pendente · Fase 5 |
| `/pedido/[codigo]` | 🔴 Pendente · Fase 6 |
| `/pedido/[codigo]/rastreamento` | 🔴 Pendente · HTML ainda não criado |
| `/conta/login` | 🔴 Pendente · HTML ainda não criado |
| `/conta/pedidos` | 🔴 Pendente · HTML ainda não criado |
| `/conta/fidelidade` | 🔴 Pendente |
| `/admin/*` | 🔴 Pendente · Fase 6 |

### Componentes — Status

| Arquivo | Status |
|---|---|
| `design-tokens.ts` | ✅ Implementado (src/lib/tokens.ts) |
| `cn.ts` | ✅ Implementado (src/lib/utils.ts) |
| `Button.tsx` — 5 variantes | ✅ Implementado |
| `Badge.tsx` | ✅ Implementado |
| `Input.tsx` | ✅ Implementado |
| `Card.tsx` | ✅ Implementado · commit d102e19 |
| `QuantitySelector.tsx` | ✅ Implementado |
| `ProductCard.tsx` | ✅ Implementado |
| `ProductCardSkeleton.tsx` | ✅ Implementado |
| `EmptyState.tsx` — 5 contextos | ✅ Implementado |
| `Navigation.tsx` | ✅ Implementado |
| `Footer.tsx` | ✅ Implementado |
| `HeroBanner.tsx` | ✅ Implementado · slider Framer Motion |
| `TrustBadges.tsx` | ✅ Implementado |
| `CategoryGrid.tsx` | ✅ Implementado |
| `ProductGrid.tsx` | ✅ Implementado · Sessão 044 |
| `FeaturedProducts.tsx` | ✅ Implementado |
| `NewsletterPopup.tsx` | ✅ Implementado · commits a6853d9 e 7378521 |
| `CartDrawer.tsx` | ✅ Implementado · src/components/cart/CartDrawer.tsx · commit 0699a3a |
| `CartProvider.tsx` | ✅ Implementado · src/components/cart/CartProvider.tsx · commit c24aea1 |
| `CheckoutStepper.tsx` | 🔴 Pendente |
| `OrderTimeline.tsx` | 🔴 Pendente |
| `Modal.tsx` | ✅ Implementado · commit a685057 |
| `FidelityCard.tsx` | 🔴 Pendente |
| `AdminSidebar.tsx` | 🔴 Pendente |

### Próximas entregas (prioridade)
1. Fase 4.2 — conectar `PdpActions.tsx` ao carrinho real (`addToCart` de `@/lib/cart`)
2. Fase 4.3 — conectar `AddToCartSelector.tsx` ao carrinho real
3. Fase 5.1 — `CheckoutStepper.tsx` + Mercado Pago

### Lembrete `/pedido/[codigo]`
Ao implementar: botão "Tive um problema com meu pedido" → `https://wa.me/5534997819292`
com mensagem pré-preenchida via `encodeURIComponent` contendo o código do pedido.
Idem em `/conta/pedidos` por linha de pedido.

---

## HTMLs Aprovados — Referência Visual para TSX

> Arquivos em `html-referencias/` na raiz do projeto.
> Todo componente visual **deve** ser implementado a partir do HTML aprovado correspondente.
> Nunca inventar layout — se não existe HTML aprovado, não implementar.

| Arquivo HTML | Componente / Rota TSX alvo | Status |
|---|---|---|
| `granel_home.html` | Homepage completa | ✅ Implementada |
| `product_cards_granel_final.html` | `ProductCard.tsx` | ✅ Implementado |
| `DiferenciaisSection_v5.html` | `DiferenciaisSection.tsx` | ✅ Implementada |
| `loja_catalog_v2.html` | `/loja` | ✅ Implementada · Sessão 044 |
| `product_detail.html` | `/loja/[categoria]/[slug]` — PDP | ✅ Implementada · Sessão 046 |
| `mini_cart_final_3.html` | `CartDrawer.tsx` | 🔴 Pendente · Fase 4.1 |
| `checkout_page.html` | `/checkout` | 🔴 Pendente · Fase 5 |
| `order_confirmation.html` | `/pedido/[codigo]` | 🔴 Pendente · Fase 6 |

### HTMLs ainda não criados — criar antes de implementar as rotas

| HTML a criar | Rota alvo | Quando |
|---|---|---|
| `order_tracking.html` | `/pedido/[codigo]/rastreamento` | Antes da Fase 6 |
| `login_cadastro.html` | `/conta/login` | Antes da Fase 6 |
| `minha_conta.html` | `/conta/pedidos` | Antes da Fase 6 |

---

## Lições Permanentes

| Erro cometido | Solução correta |
|---|---|
| `pr-12` em `overflow-x-auto` não garante padding no fim do scroll | Spacer `shrink-0` inline ou remover o elemento conflitante |
| Schema desatualizado → query com campo errado | Verificar seção Supabase neste arquivo antes de escrever queries |
| `console.log` de diagnóstico esquecido no commit | `Select-String "console.log" src/` antes de `git add` |
| `style` inline com valor estático | Converter para classes Tailwind — `style` só para valores dinâmicos |
| `text-[14px]` quando existe `text-sm` | Verificar escala Tailwind antes de usar valor arbitrário `[N]` |
| Array `.filter(Boolean).join(' ')` para classes | Sempre `cn()` de `@/lib/utils` |
| Cache corrompido do webpack após criar arquivo | `npm run build:clean` — nunca `npm run build` após criar/mover arquivos |
| `missing required error components` no dev | `taskkill /F /IM node.exe` + `Remove-Item -Recurse -Force .next` + `npm run dev` |
| Import default vs named export | `Select-String "^export"` no arquivo antes de importar em `page.tsx` |
| `poppins.variable` no `<html>` não aplica a fonte | `poppins.className` no `<body>` — `.variable` só expõe o CSS var |
| `pt-[195px]` no `<main>` com Navigation sticky | Navigation é `sticky` — `<main>` não precisa de compensação |
| Commit vazio (blob `e69de29`) | `git diff --staged --stat` antes de todo commit |
| `@supabase/auth-helpers-nextjs` | Usar `@supabase/ssr` |
| Badge com `number` como children direto | Template literal `` `${n}% OFF` `` — nunca JSX com number diretamente |
| RLS policy sem `GRANT SELECT` — tabela pública invisível para `anon` | RLS policy e `GRANT SELECT` são duas camadas independentes no Postgres. Após criar qualquer tabela pública: (1) `CREATE POLICY ... USING (...)`, (2) `GRANT SELECT ON tabela TO anon, authenticated` |
| `<Link>` envolvendo `ProductCard` | HTML inválido — `<a>` não pode conter `<button>`. `ProductCard` tem `WishlistButton` e `AddToCartSelector` internos. Renderizar sem wrapper `<Link>`. |
| `generateMetadata` + Page Component com mesma query | Usar `cache()` do React: `const fn = cache(queryFn)` — dedup automático, apenas 1 query por requisição. |
| Tabela nova sem GRANT → 401 silencioso em produção | Toda tabela criada via migration precisa de duas etapas obrigatórias: (1) `GRANT SELECT ON tabela TO anon, authenticated` e (2) `CREATE POLICY ... FOR SELECT USING (true)` + `ALTER TABLE tabela ENABLE ROW LEVEL SECURITY`. Sem isso a tabela existe no banco mas é invisível para o client anon do Supabase — retorna 401 que o código engole e exibe EmptyState. `product_images` ficou sem isso da Sessão 033 até a Sessão 051. |

---

## Contexto de Negócio — Ler Antes de Qualquer Decisão de Marketing ou Analytics

### Empresa
Granel da Praça — produtos naturais a granel desde 2019 · duas unidades físicas em Uberlândia, MG

- **Fundinho:** Praça Clarimundo Carneiro, 119 · WhatsApp (34) 99781-9292
- **UMC** (quiosque, sem retirada): Rua Rafael Marino Neto, 600 · WhatsApp (34) 99796-9191
- **Pedidos online (atual):** graneldapraca.goomer.app
- **Instagram:** @graneldapraca

### Site Institucional — Existe e Está no Ar
- Repositório separado: `Andressadanfre/graneldapraca-landing`
- URL: www.graneldapraca.com.br · Stack: HTML/CSS/JS puro · Deploy: Vercel
- Provisório — será substituído pelo e-commerce no lançamento.
- Runbook de troca de domínio documentado no Notion Módulo 5 — **nunca inventar processo**.

### Infraestrutura de Marketing — Já Existe (não recriar)

| Item | Status | Detalhe |
|---|---|---|
| GA4 | ✅ Ativo | ID G-C6W30XMXN3 · propriedade 491153641 · instalado no landing |
| Google Ads | ✅ Ativo | Conta 760-664-9903 · R$20-30/dia · CTR 9,59% · segmentação Uberlândia |
| Google Ads conversão | ✅ Configurado | AW-763361661 |
| Meta Pixel | ✅ Instalado | ID 2291807841017792 · instalado no landing |
| Meta Ads | 🔴 Não ativo | 2 campanhas desativadas · 1 rascunho · execução pós-dados de conversão |
| Search Console | ✅ Verificado | Domínio graneldapraca.com.br verificado |
| UTM taxonomy | ✅ Definida | Google: `utm_source=google&utm_medium=cpc&utm_campaign=fundinho\|umc` · Meta: `utm_source=meta&utm_medium=paid_social` |
| UptimeRobot | ✅ Ativo | Monitora site e Supabase API a cada 5 min com alertas por email |

### Eventos GA4 Já Ativos no Landing
- `clique_goomer` — 40,5% dos visitantes
- `clique_whatsapp_fundinho` — 19,4%
- `clique_whatsapp_umc` — 3,3%
- Todos marcados como Eventos Principais → sincronizados com Google Ads 760-664-9903

### O Que Isso Muda no E-commerce
- **GA4:** usar mesma propriedade G-C6W30XMXN3 — **nunca criar nova**
- **Meta Pixel:** usar mesmo ID 2291807841017792 — **nunca criar novo**
- **UTM:** seguir taxonomy já definida — **nunca criar padrão novo**
- Eventos de e-commerce (`view_item`, `add_to_cart`, `purchase` etc.) entram na Fase 7 — Launch via GTM (`@next/third-parties/google` no `layout.tsx`)
- Troca de domínio: seguir runbook Módulo 5 — pausar campanhas → trocar → reativar

### Documentação de Marketing no Notion

| Módulo | Conteúdo | Quando ler |
|---|---|---|
| 📍 5 — Lançamento e PDCA | Runbook de domínio · checklist rastreamento · validação GIGO | Antes do lançamento |
| 📍 7 — SEO, Performance e Qualidade | Eventos GA4 · JSON-LD · sitemap · robots | Antes de qualquer nova página pública |
| 🌿 Site Institucional & Marketing Digital | Log completo das campanhas · performance · decisões | Contexto de marketing |

### GXO — Itens Pendentes de Implementação (não documentados em outro lugar)
- `llms.txt` na raiz do e-commerce — arquivo de contexto para IAs (ver Mapa do Projeto)
- `robots.ts`: permitir explicitamente GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot
- Schema.org Product nas PDPs — especificado no Módulo 7
- Calculadora de consumo a granel — ferramenta de marketing pós-lançamento

---

## Lições da Sessão 047 — Aprendizados de Processo e Técnica

| Aprendizado | Detalhe |
|---|---|
| RLS e GRANT são camadas independentes | `service_role` com `rolbypassrls = true` ainda precisa de `GRANT UPDATE` na tabela. Bypass de RLS ≠ permissão de tabela. Diagnosticar via `information_schema.role_table_grants` |
| Parser manual de `.env` não remove aspas | `line.slice(eqIdx + 1).trim()` retorna `"eyJ..."` com aspas se o valor estiver entre aspas no arquivo. Fix: `.replace(/^["']|["']$/g, '')` após o trim |
| Skills antes — não quando lembrado | Padrão obrigatório: ler skill relevante → diagnóstico → proposta → aprovação. Nunca proposta primeiro |
| Cursor não é fonte de verdade | Cursor mistura correto com errado na análise do projeto. Fonte de verdade: código em disco + Notion + CLAUDE.md. Cursor é executor, não auditor |
| Documentação incompleta gera suposições erradas | Se o CLAUDE.md não tem uma informação, qualquer IA vai inventar. GA4, Meta Pixel e UTM já existiam — sem documentação, foram propostos como se não existissem |
| Notion MCP: `insert_content` confiável · `update_content` em tabelas não | `update_content` falha silenciosamente em células de tabela. Padrão correto: inserir bloco autoritativo no topo com `position: start` e marcar conteúdo abaixo como histórico |
| Uma IA só sabe o que está no contexto | O CLAUDE.md é a única fonte que todo agente lê obrigatoriamente. Tudo que não está nele será inventado ou ignorado |
