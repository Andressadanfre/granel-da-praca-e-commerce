> **Documento vivo.** Atualizar ao final de cada sessão. Responde em 30 segundos "onde estou" sem ler o log completo.
> 

---

# 🔍 Auditoria de Código — 20/05/2026 às 15:20

> Auditoria completa realizada na Sessão 035 com o agente Composer do Cursor. Escopo: 30 arquivos em `src/components/`, `src/app/` e `src/lib/`. Uma segunda opinião de outro Senior foi incorporada ao plano de ação.
> 

## Resultado Geral

| Métrica | Valor |
| --- | --- |
| Total de problemas identificados | 52 |
| 🔴 Críticos | 2 |
| 🟡 Médios | 38 |
| 🟢 Baixos | 12 |

**Arquivos 100% limpos (zero ocorrências):**

`src/lib/tokens.ts` · `src/lib/utils.ts` · `src/app/layout.tsx` · `src/app/not-found.tsx` · `src/components/ui/Button.tsx` · `src/components/ui/Input.tsx` · `src/components/ui/QuantitySelector.tsx` · `src/components/product/WishlistButton.tsx` · `src/components/product/ProductCardSkeleton.tsx`

---

## 🔴 Críticos — Bloqueadores de lançamento

### 1. `CategoryGrid.tsx` — dados hardcoded

**Arquivo:** `src/components/sections/CategoryGrid.tsx` · Linhas 68–75

**Problema:** Array `CATEGORIES` com slugs, nomes e contagens de produtos fixos no código (`48`, `62`, `396` etc). O banco real tem 11 categorias e 402 produtos com slugs diferentes dos mockados. A tela exibe informações falsas para o usuário.

**Correção:** conectar ao Supabase com query real de categorias + `COUNT` de produtos ativos agrupado por categoria.

### 2. `NewsletterForm.tsx` — submit simulado

**Arquivo:** `src/components/layout/NewsletterForm.tsx` · Linhas 13–16

**Problema:** O botão "Quero receber" executa um `await new Promise(...)` falso que simula sucesso sem enviar nada para nenhum backend. O usuário acredita que se cadastrou mas não há registro em lugar nenhum.

**Correção:** Server Action real com inserção em tabela `newsletter_subscriptions` no Supabase.

---

## ⚠️ Segurança — Risco Arquitetural

### `supabase.ts` — service_role com createBrowserClient

**Arquivo:** `src/lib/supabase.ts` · Linhas 36–40

**Problema:** `getSupabaseAdmin()` usa `createBrowserClient` junto com `SUPABASE_SERVICE_ROLE_KEY`. A `service_role` ignora todas as regras de RLS (Row Level Security) do Supabase. Se essa chave vazar para o browser, qualquer usuário pode ler, alterar ou deletar qualquer dado do banco sem restrição.

**Correção:** `getSupabaseAdmin()` deve usar `createClient` do `@supabase/supabase-js` puro (sem SSR/cookies), executado exclusivamente em Server Components, Server Actions ou Route Handlers. Nunca instanciar no cliente.

---

## 🟡 Médios — Qualidade e Manutenção

### Border shorthand conflitante — `CategoryBar.tsx`

**Linhas:** 135–136, 153–154, 175–178

**Problema:** `className` com `border-t-2 border-l-2 border-r-2` (via `linkBase`) combinado com `style={{ borderBottom: '...' }}` no mesmo elemento. Mistura de shorthand CSS com propriedades individuais gera comportamento imprevisível e já causou bug de hidratação em sessão anterior.

✅ Resolvido · Sessão 040 · commit 2b6d702 — `border-b-2` + classes condicionais Tailwind · `usePathname()` para estado ativo exclusivo

Tipagem fraca — `FeaturedProducts.tsx`

**Linhas:** 66, 76

**Problema:** Cast `as unknown as ProductRow[]` contorna o sistema de tipos do TypeScript. Se a estrutura da query mudar, o erro só aparecerá em runtime, não em tempo de compilação.

✅ Resolvido · Sessão 039 · tipo `ProductWithCategory` correto · zero cast `as unknown`

### Classes Tailwind conflitantes — `CategoryGrid.tsx`

**Linha:** 161–164

**Problema:** `font-semibold` (classe base) e `font-bold` (variante `isAll`) aplicadas no mesmo `<span>`. A última declarada vence, mas o conflito é desnecessário e pode gerar confusão em manutenções futuras.

### `console.error` em produção — `error.tsx`

**Linha:** 13

**Problema:** `console.error('[GlobalError]', ...)` dentro de `useEffect` será visível no browser em produção.

### Cores hex hardcoded fora dos tokens do DS

**Arquivos afetados:** `globals.css`, `error.tsx`, `Navigation.tsx`, `MobileNavDrawer.tsx`, `Footer.tsx`, `NewsletterForm.tsx`, `TrustBadges.tsx`, `CategoryGrid.tsx`, `HeroBanner.tsx`, `HeroSlider.tsx`, `ProductCard.tsx`, `EmptyState.tsx`, `Badge.tsx`

**Problema:** Dezenas de hex (`#6B7280`, `#374151`, `#F0FDF4`, `#86EFAC`, `#DCFCE7` etc) espalhados nos arquivos em vez de usar os tokens centralizados de `src/lib/tokens.ts` ou classes semânticas do Tailwind.

**Exceção aceita:** cores da marca Google em `UserMenuPopover.tsx` (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) — são identidade de marca externa, não do DS.

✅ Parcial · Sessão 040 · commit 7c8e2e3 — Badge, EmptyState, TrustBadges limpos · Navigation, HeroBanner, MobileNavDrawer, Footer entram no Bloco 9

---

## 🟢 Baixos — Dívida Técnica

### `'use client'` — `AddToCartSelector.tsx` — ✅ Avaliado

**Resultado:** `'use client'` é necessário. `QuantitySelector` é Client Component com `useState` e event handlers. Remover causaria erro de fronteira Server/Client. Não alterar.

### Dados estáticos de marketing — aceitável por ora

**Arquivos:** `TrustBadges.tsx` (textos de frete/WhatsApp), `HeroSlider.tsx` (paths de imagem fixos, copy "+390 produtos"), `HeroBanner.tsx` ("Mais de 390 produtos"), `Footer.tsx` (links institucionais)

**Situação:** não são erros graves no momento. No futuro, uma tabela de configurações no Supabase permitirá editar esses textos sem novo deploy. Prioridade baixa até existir painel admin.

**Atenção:** o valor de frete grátis fixo em `TrustBadges.tsx` (`R$100`) precisa ser consistente com a lógica dinâmica do `CartDrawer` quando ele for implementado.

### Fallback de imagem — `ProductCard.tsx`

**Problema:** Produtos sem `imageUrl` no banco exibem apenas placeholder SVG genérico. Criar imagem padrão da marca como fallback visual.

### Duplicação de `formatBRL` — `ProductCard.tsx` e `utils.ts`

**Problema:** Função definida em dois lugares. Usar apenas a versão de `src/lib/utils.ts`.

---

## Plano de Correção — Ordem de Execução

| Bloco | O que corrigir | Arquivo(s) | Status |
| --- | --- | --- | --- |
| **1 — Segurança** | `getSupabaseAdmin()` usar `createClient` puro, nunca `createBrowserClient` | `src/lib/supabase.ts` | ✅ Concluído · Sessão 035 · commit 88740b0 |
| **2 — Crítico** | Server Action real de newsletter com Supabase | `src/components/layout/NewsletterForm.tsx` | ✅ Concluído · Sessão 035 · commit ab0f960 |
| **3 — Crítico** | Query real de categorias + contagens do banco | `src/components/sections/CategoryGrid.tsx` | ✅ Concluído · componente removido da homepage · será usado em /loja |
| **4 — Arquitetura** | Eliminar cast `as unknown as ProductRow[]` | `src/components/sections/FeaturedProducts.tsx` | ✅ Concluído · tipo ProductWithCategory correto · zero cast · Sessão 039 |
| **5 — Arquitetura** | Resolver border shorthand conflitante | `src/components/layout/CategoryBar.tsx` | ✅ Concluído · commit 2b6d702 · Sessão 040 |
| **6 — DS** | Mapear tokens no `tailwind.config.ts` e substituir hex hardcoded | Múltiplos arquivos | ✅ Parcial · commit 7c8e2e3 · componentes UI limpos · arquivos de layout entram no Bloco 9 |
| **7 — Baixo** | Avaliar remoção do `'use client'` | `AddToCartSelector.tsx` | ✅ Avaliado · Sessão 040 · `'use client'` necessário — `QuantitySelector` é Client Component com `useState` · não remover |
| **8 — Baixo** | Fallback de imagem no ProductCard | `ProductCard.tsx` | 🔴 Pendente |
| **9 —  Refatoração** | Converter `style` inline estático → Tailwind | `Navigation.tsx` · `HeroBanner.tsx` · `MobileNavDrawer.tsx` · `Footer.tsx` · `NewsletterForm.tsx` · `HeroSlider.tsx` · `ProductCard.tsx` | 🔴 Pendente · 1 arquivo por commit  |

---

# ✅ Estado Atual — 25/05/2026 (Sessão 040)

Repositório limpo. Build 100% limpo. Auditoria em progresso — Blocos 1 a 6 (parcial) concluídos.

- **Repo:** `github.com/Andressadanfre/granel-da-praca-e-commerce`
- **Pasta:** `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce`
- **Supabase:** `ymjmgukuojwumvtaglyp` — São Paulo — ✅ tabelas criadas e seed aplicado
- **`.env.local`:** ✅ preenchido
- **`npm run dev`:** ✅ compilando sem erros
- **Tailwind:** v3 confirmado
- **Último commit:** `7c8e2e3` — fix(bloco-6): mapear tokens warning/icon-bg e substituir hex hardcoded em Badge, EmptyState e TrustBadges
- **Homepage `/`:** ✅ Navigation 3 camadas · HeroBanner slider · TrustBadges · DiferenciaisSection · FeaturedProducts · Footer

---

## ⚠️ Decisão de Arquitetura — HeroBanner (Sessão 031)

> **MUDANÇA DE PLANO em relação ao HTML aprovado `granel_home.html`.**
> 

> O HTML de referência previa uma imagem estática na coluna direita do Hero. Essa abordagem foi **substituída por um slider animado** com Framer Motion.
> 

### O que foi implementado:

- **`HeroBanner.tsx`** → Server Component — estrutura da seção (copy, CTAs, eyebrow, trust badges)
- **`HeroSlider.tsx`** → Client Component (`'use client'`) — slider com Framer Motion `AnimatePresence`
- **Efeito:** zoom-in + desfoque na entrada (`scale 1.08→1, blur 8px→0`) · saída acelerada (`scale 1→1.04, blur 0→6px`)
- **Easing entrada:** `cubic-bezier(0.22, 1, 0.36, 1)` (expo out dramático) · **Saída:** `cubic-bezier(0.4, 0, 1, 1)`
- **Intervalo:** 6 segundos entre slides
- **Dots de navegação** clicáveis no canto inferior direito (pill animado)
- **Badge flutuante** `+390 produtos / Desde 2019` no canto inferior esquerdo da imagem
- **3 slides com imagens reais WebP** convertidas de PNG via Sharp

### Assets de imagem:

- `public/images/hero/hero-01.webp` (~126kb)
- `public/images/hero/hero-02.webp` (~114kb)
- `public/images/hero/hero-03.webp` (~121kb)
- Formato: WebP · qualidade 85 · gerados via `sharp` em `node_modules`
- `next/image` com `fill` + `sizes="(max-width: 768px) 100vw, 50vw"` + `priority` no slide 0

### Arquitetura crítica — não alterar sem entender:

- `HeroBanner.tsx` é **Server Component** — não tem `'use client'`
- `HeroSlider.tsx` é **Client Component** isolado — fronteira de renderização clara
- **NÃO adicionar** `useEffect`, `useState` ou event handlers diretamente no `HeroBanner.tsx`
- Se precisar adicionar novos slides: editar apenas o array `SLIDES` em `HeroSlider.tsx`
- Se precisar trocar imagens: substituir os arquivos em `public/images/hero/` mantendo os nomes `hero-01.webp`, `hero-02.webp`, `hero-03.webp`
- Framer Motion v12 exige `ease` como `[number, number, number, number]` (tuple tipada) — não `number[]`

---

# 🔴 Próximo Passo — Sessão 040

> 📌 **Lembrete para `/pedido/[codigo]`:** ao implementar essa rota, incluir botão "Tive um problema com meu pedido" que abre `https://wa.me/5534997819292` com mensagem pré-preenchida via `encodeURIComponent` contendo o código do pedido. Idem em `/conta/pedidos` por linha de pedido. Decisão registrada no PRD (doc 02 — seção Devolução e Problemas com Pedido).
> 

## Seguir ordem do plano de auditoria (20/05/2026) — sem pular blocos

## ✅ Bloco 4 — FeaturedProducts tipagem — CONCLUÍDO

Tipo `ProductWithCategory` com `Pick<Tables<'products'>>` já aplicado. Zero cast `as unknown`. Confirmado via leitura do arquivo na Sessão 039.

## Bloco 5 — CategoryBar border shorthand ← INICIAR AQUI

Resolver `border-t-2 border-l-2 border-r-2` (className) combinado com `style={{ borderBottom }}` no mesmo elemento em `src/components/layout/CategoryBar.tsx` linhas 135–136, 153–154, 175–178.

## Bloco 6 — Tokens DS — hex hardcoded

Substituir hex hardcoded por tokens em múltiplos arquivos.

## Bloco 7 — AddToCartSelector `'use client'`

Avaliar remoção do `'use client'` desnecessário em `src/components/product/AddToCartSelector.tsx`.

## Bloco 8 — Fallback de imagem ProductCard

Criar imagem padrão da marca como fallback em `src/components/product/ProductCard.tsx`.

## ⚠️ Schema real do Supabase — confirmado na Sessão 036

**Tabela `categories` (9 colunas):**

- Usa `is_active` (boolean) — **não `is_deleted`**
- Usa `sort_order` (smallint) — **não `display_order`**
- Não tem coluna `is_deleted`

**Tabela `products` (16 colunas):**

- Usa `price_cents` + `increment_grams` — **não existe `price_per_100g_cents`**
- Cálculo granel: `price_cents / increment_grams * 100` = preço por 100gr
- Tem `compare_at_cents`, `is_active`, `stock_status` — não documentados na skill
- `is_deleted` existe aqui ✅

**Ação:** atualizar `.claude/skills/supabase-granel/SKILL.md` com schema correto na Sessão 037.

# ✅ O que foi feito na Sessão 035

## Bugs corrigidos — CategoryBar

### Bug 1 — Dropdown "Mais" aparecia vazio

**Sintoma:** botão "Mais" abria mas o painel exibia vazio.

**Diagnóstico:** o `console.log` adicionado na Sessão 034 confirmou que `visibleCount`, `visibleCats` e `overflowCats` estavam com valores corretos em runtime. O dropdown estava populado — o problema era de decisão de produto: o link "Ofertas da semana" estava ocupando espaço e gerando confusão visual junto com a seta de scroll.

**Resolução:** decisão tomada de remover o `promoLink` completamente do componente (ver Bug 2).

### Bug 2 — Seta direita sobrepondo "Ofertas da semana"

**Sintoma:** o `ChevronRight` (seta de scroll) ficava sobreposto ao link "Ofertas da semana" no final da barra.

**Causa raiz:** o `pr-12` (48px) aplicado ao container `overflow-x-auto` não cria padding confiável no final do scroll track em todos os browsers quando o conteúdo excede a largura. O último item ficava atrás da seta `absolute right-0`.

**Resolução adotada:** decisão de produto — remover o link "Ofertas da semana" da CategoryBar inteiramente. Solução mais limpa do que adicionar spacer ou ajustar z-index.

## Arquivos alterados

### `src/components/layout/CategoryBar.tsx`

- Removido `promoLink: CategoryLink` da interface `Props`
- Removido `promoLink` do destructuring do componente
- Removido bloco JSX inteiro do link "Ofertas da semana" (tag `Link` + SVG de tag)
- Removido `console.log` de diagnóstico que havia sido adicionado na Sessão 034
- A barra agora exibe: "Ver tudo" (fixo) + categorias dinâmicas do banco + botão "Mais" com dropdown quando há overflow

### `src/components/layout/Navigation.tsx`

- Removida prop `promoLink={{ href: '/ofertas', label: 'Ofertas da semana' }}` da chamada `<CategoryBar />`
- `categoryLinks` renomeado para `categories` (consistência com o nome da prop)
- `MobileNavDrawer` atualizado para `links={categories}` (mesma fonte de dados)

## Limpeza pendente (baixa prioridade)

- `globals.css` ainda contém `.nav-promo-link:hover` — classe órfã, não causa bug, remover em oportunidade futura

## Commit

- **Hash:** `976d590`
- **Mensagem:** `fix: remove promoLink do CategoryBar e corrige dropdown Mais`
- **Branch:** `master`
- **Push:** ✅ origin/master

## Build

- `npm run build 2>&1` → ✅ sem erros · sem warnings TypeScript
- 2 arquivos alterados · 257 inserções · 70 deleções

---

## ✅ O que foi feito na Sessão 034

- GitHub sincronizado — 19 commits pushados para `origin/master`
- `getSupabaseAdmin()` criada em `supabase.ts` — client sem cookies para Server Components de leitura
- `GRANT SELECT` aplicado via MCP nas 4 tabelas para `service_role`
- `FeaturedProducts.tsx` com query real funcionando — 4 produtos do banco renderizando
- `Suspense` + `ProductCardSkeleton` adicionado no `page.tsx`
- `export const dynamic = 'force-dynamic'` em `page.tsx`
- `Navigation.tsx` refatorado para `async` com query de categorias reais
- `CategoryBar.tsx` criado como Client Component — scroll horizontal, dropdown "Mais", setas laterais
- `CategoryBar.tsx` refatorado para padrão correto (Tailwind + style DS) após entrega com código sujo
- `globals.css` atualizado com classes `.hide-scrollbar`, `.nav-cat-link`, `.dropdown-cat-link`

## ✅ O que foi feito na Sessão 033

### Banco de dados — Supabase `ymjmgukuojwumvtaglyp`

- 4 migrations aplicadas via MCP: `categories`, `app_users`, `products`, `product_images`
- **402 produtos** inseridos via seed (5 lotes) com preços em centavos
- **11 categorias reais** da planilha — ordem definida para o CategoryGrid
- 4 produtos marcados como `is_featured = true`: Castanha do Pará · Chia · Granola sem Açúcar Prinat · Óleo de Coco EV Copra 500ml
- Tipos criados: `product_unit` enum (`KG`, `UN`, `SC`, `CX`, `BL`) · `product_type` enum (`granel`, `unit`)

### Categorias reais — ordem do grid do site

1. Castanhas · 2. Grãos e Sementes · 3. Temperos e Especiarias · 4. Chás e Infusões · 5. Frutas Secas · 6. Snacks · 7. Chocolates de Verdade · 8. Farinhas · 9. Suplementos Naturais · 10. Cosméticos Naturais · 11. Óleos e Adoçantes Naturais

### FeaturedProducts.tsx — query real implementada

- Mocks substituídos por query `getSupabaseServer()` ao Supabase
- Mapper `toCardProps()`: `granel` → `priceInCents = price_cents / 10` (por 100gr) · `unit` → preço cheio
- Fallback: se nenhum `is_featured`, busca os 4 mais recentes
- Build TypeScript limpo ✅ — fix de tipo `categories: { name: string }[] | null`
- **Bug pendente:** seções não aparecem no browser — investigar `page.tsx` na Sessão 034

## ⚠️ Decisão de Arquitetura — TrustBadges vs Diferenciais (Sessão 031)

> **São dois componentes diferentes. Não confundir.**
> 

### TrustBadges.tsx — implementar PRIMEIRO (Sessão 032)

- **O que é:** faixa horizontal compacta com 4 ícones + texto curto
- **Posição:** imediatamente abaixo do Hero, antes das categorias
- **4 itens:** Frete Grátis · Atendimento WhatsApp · Pagamento Seguro · Produtos Frescos
- **Referência:** DS v3.1 (container ícone `40×40px` · ícone `24×24px` · título `14px/600` · subtítulo `12px/400`)
- **Observação:** o `granel_home.html` não tem esse componente como seção separada — no HTML os trust badges aparecem inline na coluna esquerda do Hero como 2 pills. O `TrustBadges.tsx` é o componente standalone planejado no DS v3.1 para uso em múltiplas páginas.
- **Arquivo:** `src/components/sections/TrustBadges.tsx` — **Server Component**

### DiferenciaisSection.tsx — ✅ Implementado

- **O que é:** seção completa com 3 cards grandes em grid 3 colunas
- **Conteúdo:** Entrega Rápida · Qualidade Garantida · Variedade a Granel
- **Detalhe:** card central destacado (conforme `granel_home.html`)
- **Posição:** seção da homepage entre FeaturedProducts e Ofertas
- **Arquivo:** `src/components/sections/DiferenciaisSection.tsx` — **Server Component** ✅ na homepage

---

# Rotas — Status

| Rota | Status |
| --- | --- |
| `/` | ✅ Homepage montada · Sessão 032 |
| `/loja` | 🔴 Pendente |
| `/loja/[categoria]/[slug]` | 🔴 Pendente |
| `/carrinho` | 🔴 Pendente |
| `/checkout` | 🔴 Pendente |
| `/pedido/[codigo]` | 🔴 Pendente |
| `/conta/login` | 🔴 Pendente |
| `/conta/pedidos` | 🔴 Pendente |
| `/conta/fidelidade` | 🔴 Pendente |
| `/admin/*` | 🔴 Pendente |
| `/preview` | ✅ Dev only — todos os componentes validados |

---

# Componentes — Status

## UI Base

| Componente | Arquivo | Status |
| --- | --- | --- |
| `design-tokens` | `src/lib/tokens.ts` | ✅ |
| `cn`  • utils | `src/lib/utils.ts` | ✅ Bug formatGrams corrigido |
| `Button.tsx` | `src/components/ui/Button.tsx` | ✅ 5 variantes |
| `Badge.tsx` | `src/components/ui/Badge.tsx` | ✅ 6 variantes · tokens semânticos · Sessão 040 |
| `Input.tsx` | `src/components/ui/Input.tsx` | ✅ floating label |
| `QuantitySelector.tsx` | `src/components/ui/QuantitySelector.tsx` | ✅ granel/unit |
| `Card.tsx` | `src/components/ui/Card.tsx` | 🔴 Pendente |
| `Modal.tsx` | `src/components/ui/Modal.tsx` | 🔴 Pendente |

## Produto

| Componente | Arquivo | Status |
| --- | --- | --- |
| `ProductCard.tsx` | `src/components/product/ProductCard.tsx` | ✅ 5 estados · 2 variantes |
| `WishlistButton.tsx` | `src/components/product/WishlistButton.tsx` | ✅ Client Component autônomo |
| `AddToCartSelector.tsx` | `src/components/product/AddToCartSelector.tsx` | ✅ `'use client'` necessário · QuantitySelector tem useState · Sessão 040 |
| `ProductCardSkeleton.tsx` | `src/components/product/ProductCardSkeleton.tsx` | ✅ shimmer CSS puro · prop count |
| `EmptyState.tsx` | `src/components/product/EmptyState.tsx` | ✅ 5 contextos · ícone convertido para Tailwind · Sessão 040 |

## Layout

| Componente | Arquivo | Status |
| --- | --- | --- |
| `Navigation.tsx` | `src/components/layout/Navigation.tsx` | ✅ 3 camadas · Sessão 030 |
| `UserMenuPopover.tsx` | `src/components/layout/UserMenuPopover.tsx` | ✅ Client Component |
| `MobileNavDrawer.tsx` | `src/components/layout/MobileNavDrawer.tsx` | ✅ Client Component |
| `Footer.tsx` | `src/components/layout/Footer.tsx` | ✅ newsletter + 4 colunas · Sessão 030 |
| `NewsletterForm.tsx` | `src/components/layout/NewsletterForm.tsx` | ✅ Client Component |

## Seções

| Componente | Arquivo | Status |
| --- | --- | --- |
| `HeroBanner.tsx`  • `HeroSlider.tsx` | `src/components/sections/HeroBanner.tsx` | ✅ Slider Framer Motion · 3 imagens WebP · Sessão 031 |
| `TrustBadges.tsx` | `src/components/sections/TrustBadges.tsx` | ✅ Tokens DS limpos · cn() · Sessão 040 |
| `CategoryGrid.tsx` | `src/components/sections/CategoryGrid.tsx` | ✅ Query real · removido da homepage · será usado em /loja |
| `FeaturedProducts.tsx` | `src/components/sections/FeaturedProducts.tsx` | ✅ Query real · tipagem correta · Sessão 039 |
| `NewsletterPopup.tsx` | `src/components/sections/NewsletterPopup.tsx` | 🔴 Pendente |

---

# HTMLs Aprovados — Referência para TSX

| HTML | Componente TSX alvo |
| --- | --- |
| `product_cards_v2.html` | `ProductCard.tsx` ✅ implementado |
| `granel_home.html` | Homepage completa |
| `mini_cart_final_3.html` | `CartDrawer.tsx` |
| `product_detail.html` | Página `/loja/[categoria]/[slug]` |
| `order_confirmation.html` | Página `/pedido/[codigo]` |
| `footer_granel.html` | `Footer.tsx` |

---

# Pendências de Infraestrutura

- [✅] `.env.local` preenchido com keys do Supabase `ymjmgukuojwumvtaglyp`
- [✅] Tokens DS v3.1 validados no browser via `/preview`
- [✅] `@supabase/ssr` instalado — `supabase.ts` atualizado
- [✅] Schema SQL aplicado — 4 tabelas criadas · 402 produtos · 11 categorias
- [ ]  Conectar Vercel ao novo repo `granel-da-praca-e-commerce`
- [ ]  Apagar projeto antigo no Vercel (fazer manualmente em [vercel.com/settings](http://vercel.com/settings))
- [ ]  Gerar descrições de produto com IA para os 390 itens (script batch Node.js + API Anthropic → coluna `description` no Supabase) — prioridade: categorias de maior margem (Castanhas, Superalimentos, Proteínas) primeiro. Sem descrições as PDPs não rankeiam no Google. **Fazer antes do lançamento.**

---

# ⚠️ Lições Permanentes

| Erro | Solução |
| --- | --- |
| `pr-12` em `overflow-x-auto` não garante padding no fim do scroll | Usar spacer `shrink-0` inline ou remover o elemento conflitante |
| Schema da skill desatualizado causou query com campo errado | Sempre verificar schema real via MCP antes de escrever query — `categories` usa `is_active` não `is_deleted` · `products` não tem `price_per_100g_cents` |
| `console.log` de diagnóstico esquecido no commit | Remover antes do build — `Select-String "console.log"` antes de commitar |
| `style` inline com valores estáticos | Converter para classes Tailwind — `style` prop apenas para valores dinâmicos em runtime |
| Classes arbitrárias `text-[14px]` quando existe escala padrão | Verificar escala Tailwind primeiro — `text-sm` (14px) · `text-xs` (12px) |
| Array manual + `.filter().join()` para classes condicionais | Sempre `cn()` de `@/lib/utils` |
| Hex inline em objeto de estilos sem token no DS | Extrair como constante nomeada com JSDoc explicando a exceção |

---

## Lições anteriores

| Erro | Solução |
| --- | --- |
| Commit vazio (blob e69de29) | `git diff --staged --stat` antes de todo commit |
| Portas 3000/3001 ocupadas | `taskkill /F /IM node.exe`  • `Remove-Item -Recurse -Force .next` |
| Server Component com onClick | Extrair em Client Component separado (padrão WishlistButton) |
| Badge children type error | Template literal `{\`${n}% OFF`}` nunca JSX com number |
| Cursor adiciona código não solicitado | Sempre passar arquivo completo + verificar antes de testar |
| `@supabase/auth-helpers-nextjs` | Usar `@supabase/ssr` |

---

*Última atualização: 25/05/2026 · Sessão 040 — Blocos 5, 6 (parcial) e 7 concluídos · tokens warning/icon-bg criados · Badge, EmptyState, TrustBadges limpos · 'use client' no AddToCartSelector confirmado como necessário (QuantitySelector tem useState) · Bloco 8 (fallback de imagem) é o próximo · Bloco 9 criado para refatoração style inline → Tailwind*

## ⚠️ Lições da Sessão 032 — Erros e Soluções

| Erro | Solução |
| --- | --- |
| Cache corrompido do webpack após criar arquivo novo | Usar `npm run build:clean` (script `scripts/clean-build.mjs`) — NUNCA `npm run build` após criar ou mover arquivos |
| `missing required error components, refreshing...` no dev | `taskkill /F /IM node.exe`  • `Remove-Item -Recurse -Force .next`  • `npm run dev` — cache do `.next` corrompido |
| Import `default` vs named export errado no `page.tsx` | Antes de montar qualquer página, checar cada componente com `Get-Content srccomponents...X.tsx \ |
| `poppins.variable` no `<html>` não aplica a fonte no body | Usar `poppins.className` no `<body>` — `.variable` só expõe o CSS var, `.className` aplica a fonte de fato |
| `pt-[195px]` no `<main>` causou espaço em branco gigante | Só adicionar padding-top no main se o header for `position: fixed`. Navigation usa `sticky` — não precisa de compensação. Verificar com `Get-Content Navigation.tsx \ |
| Componentes com named export importados como default | Rodar `Select-String "^export"` em TODOS os componentes antes de montar o `page.tsx` — não assumir que é default |

[Sessão 037 — DiferenciaisSection substitui CategoryGrid na Homepage](https://www.notion.so/Sess-o-037-DiferenciaisSection-substitui-CategoryGrid-na-Homepage-368f86ce18e5819f96fdc13cc580bf35?pvs=21)