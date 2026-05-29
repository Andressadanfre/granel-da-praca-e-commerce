# 📍 3 — Design System

> Design System v3.1 — 15/05/2026. Fonte de verdade para Figma (arquivo `8W0t6viqI7UlqqlsFrPb6C`) e implementação no Cursor. HTML de referência aprovado: `product_cards_v2.html`.
> 

---

# Objetivo

Documentar todas as decisões de design do e-commerce antes de qualquer componente ser construído. Este documento é a fonte da verdade para o Figma e para o Cursor.

---

# Grid — Padrão de Mercado Brasileiro

| Breakpoint | Canvas Figma | Container | Margem | Colunas |
| --- | --- | --- | --- | --- |
| Desktop ≥ 1280px | **1440px** | **1280px** | **80px** | 12 |
| Tablet ≥ 768px | 1024px | 100% | 24px | 8 |
| Mobile ≥ 390px | 390px | 100% | 16px | 4 |

**Referência:** alinhado com Tailwind `max-w-screen-xl`, Bootstrap 5, Mercado Livre, Shopee BR, Amazon BR.

Tailwind: `max-w-[1280px] mx-auto px-5 xl:px-0`

---

# Paleta de Cores — FECHADA

| Token CSS | Hex | Uso |
| --- | --- | --- |
| `--g` | `#00B207` | CTAs de conversão máxima: Finalizar compra, Buscar, Confirmar pedido |
| `--gd` | `#2C742F` | Botão Adicionar ao carrinho, hover de botões |
| `--gdeep` | `#002603` | TopBar, preços em destaque, total do pedido, logo |
| `--ghover` | `#1A5C1E` | Hover de TODOS os botões CTA — único token de hover |
| `--cream` | `#F9F5EF` | Background geral — nunca branco puro |
| `--cream-img` | `#F0EBE2` | Fundo da área de imagem do ProductCard |
| `--surface` | `#F9FAFB` | Fundo de cards, inputs, itens de lista |
| `--white` | `#FFFFFF` | Background de modais, overlays |
| `--t9` | `#111827` | Texto primário, headings de conteúdo |
| `--t6` | `#4B5563` | Textos de suporte, metadados, subtítulos |
| `--t4` | `#9CA3AF` | Labels muted, preço por kg, placeholder |
| `--bd` | `#E5E7EB` | Bordas padrão, divisores |
| `--gray-100` | `#F3F4F6` | Superfícies secundárias |
| `--color-promo` | `#C0694A` | Badge de promoção/desconto — terracota queimado |
| `--color-promo-bg` | `#FBF1EE` | Background do badge de desconto percentual |
| `--color-indigo` | `#3730A3` | Badge "Por unidade" no ProductCard |
| `--color-indigo-bg` | `#EEF2FF` | Background do badge "Por unidade" |
| `--color-rating` | `#FBBF24` | Estrelas de avaliação |
| `--color-skeleton-base` | `#E5E7EB` | Placeholder de skeleton loading |
| `--color-skeleton-shimmer` | `#F3F4F6` | Shimmer de skeleton loading |
| `--color-danger` | `#EF4444` | Erros, estoque crítico, estados destrutivos |
| `--color-lime` | `#D4F567` | Badge de desconto na seção Ofertas — contraste 11:1 sobre `#1A3A00` |
| `--badge-diet-bg` | `#EAF7EA` | Background badge dieta |
| `--badge-diet-tx` | `#2C742F` | Texto badge dieta |
| `--badge-diet-bd` | `#C6E6C7` | Borda badge dieta |

> ⚠️ Cores banidas: `#1A1A1A`, `#333333`, `#E65100`, `#84D187`, `#FF8A00`. Usar apenas os tokens da tabela acima.
> 

---

# Tipografia

**Fonte única:** Poppins — pesos 300/400/500/600/700

```
// app/layout.tsx
import { Poppins } from 'next/font/google'
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})
```

## Escala Canônica (extraída dos HTMLs aprovados)

| Token | Size | Weight | Uso |
| --- | --- | --- | --- |
| `display-hero` | `clamp(2rem,4vw,3rem)` | 700 | H1 Hero — tagline principal |
| `display-section` | `clamp(1.5rem,3vw,2rem)` | 600–700 | H2 títulos de seção |
| `logo` | `32px` | 500 | Logo com tracking -0.96px |
| `nav-link` | `13px` | 600 | Links de navegação principal |
| `price-main` | `20px` | 700 | Preço principal no ProductCard · tracking -0.02em |
| `card-name` | `13.5px` | 600 | Nome do produto · line-clamp 3 |
| `card-category` | `9.5px` | 600 | Categoria do produto · uppercase · tracking 0.08em |
| `card-variant` | `11px` | 500 | Variante/embalagem do produto |
| `price-label` | `10px` | 400 | Label "Preço por 100 gr" |
| `price-unit` | `11px` | 400 | Preço/kg · cor `#374151` |
| `price-old` | `12px` | 400 | Preço riscado · cor `#6B7280` |
| `badge` | `9px` | 700 | Badges de dieta · uppercase · tracking 0.04em |
| `body-review` | `0.875rem` | 400 | Texto de depoimento · color `#374151` · line-height 1.75 |
| `countdown` | `32px` | 700 | Números do countdown de ofertas |
| `rating-score` | `clamp(3.25rem,5vw,4rem)` | 700 | Nota 4.9 na seção de avaliações |

---

# Tokens de Efeito — Sombras, Transições e Bordas

## Sombras por contexto

- Card repouso: `0 10px 30px rgba(0,0,0,.05)`
- Card hover: `0 20px 50px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.04)`
- Card categoria hover: `0 16px 48px rgba(0,38,3,.10)`
- Drawer/Modal: `0 0 40px rgba(0,0,0,.15)`
- Card resumo avaliações: `0 4px 28px rgba(0,38,3,.055)`
- Botão ofertas: `0 4px 0 rgba(0,100,4,.6)` (sombra projetada)

## Border-radius canônico — FECHADO

- `--r-input: 8px` — inputs
- `--r-sel: 10px` — botão add-to-cart, pill QuantitySelector, cards de seleção
- `--r-inner: 12px` — blocos internos, QuantitySelector Split PDP
- `--r-modal: 16px` — drawer, modal
- `--r-card: 20px` — ProductCard, CategoryCard
- `24px` — cards de diferenciais, cards de avaliação
- `28px` — card hero (resumo de avaliações)
- `--r-pill: 100px` — badges, pills, chips

## Transições

- Timing canônico: `--ease: .18s cubic-bezier(.4,0,.2,1)`
- Barra de frete: `transition: width 0.4s ease-out`
- Hover cards: `translateY(-4px)` (ProductCard) · `translateY(-10px)` (CategoryCard)
- Quick Add spring: `cubic-bezier(.34,1.56,.64,1)`

## Sistema de Ícones — FECHADO

- `stroke-width: 1.6` — espessura única em todos os SVGs do projeto
- Tamanho mínimo: 16px · padrão UI: 24px
- **UI genérico** → Lucide React exclusivamente
- **Marcas e pagamentos** → SVG custom inline em `src/components/icons/brand/`
- **PROIBIDO:** `<img src="*.svg">` para ícones · sprites externos
- Todos os SVGs custom usam `currentColor`

Ícones de marca a criar: `InstagramIcon`, `FacebookIcon`, `WhatsappIcon`, `PixIcon`, `MastercardIcon`, `VisaIcon`, `MercadoPagoIcon`, `BoletoIcon`, `GranelLogoIcon`

---

# Hierarquia de CTAs — DECISÃO FECHADA

| Ação | Cor | Contexto |
| --- | --- | --- |
| Finalizar compra · Buscar · Confirmar pedido | `#00B207` (`--g`) | CTA de conversão máxima — uso restrito |
| Adicionar ao carrinho (cards do catálogo) | `#2C742F` (`--gd`) | Add-to-cart em toda a listagem |
| Adicionar ao carrinho (PDP) | `#00B207` (`--g`) | Único CTA primário na página de produto |
| Hover de todos os CTAs | `#1A5C1E` (`--ghover`) | Token único de hover |
| Wishlist ativo | `#C0694A` (`--color-promo`) | Estado ativo do favorito — terracota |

> **Regra crítica:** `#00B207` brilhante = conversão máxima · `#2C742F` escuro = adicionar ao carrinho. Nunca os dois com o mesmo peso visual na mesma tela.
> 

---

# Botões — 5 Variantes

| Variante | Background | Hover | Uso exclusivo |
| --- | --- | --- | --- |
| Primary | `#00B207` · `border-radius: --r-sel` | `#1A5C1E` | Finalizar compra · Buscar · Confirmar pedido |
| Cart | `#2C742F` · `border-radius: --r-sel` | `#1A5C1E` | Adicionar ao carrinho — diferenciado do CTA principal |
| Secondary | `border: 1.5px #00B207` · bg transparent | bg `#F1F8E9` | Ações secundárias · Ver mais |
| Ghost | sem borda · texto `#00B207` | underline | Links de ação em cards |
| Danger | `#C62828` | `#B71C1C` | Remover do carrinho · excluir |

---

# ProductCard — Especificação Completa — FECHADA

> Referência: `product_cards_v2.html` aprovado em 15/05/2026.
> 

## Dimensões e estrutura

| Decisão | Valor |
| --- | --- |
| Largura | 302px (4 cards por linha, gutter 24px, container 1280px) |
| Grid desktop | `grid-template-columns: repeat(4, 1fr)` · gap `24px` |
| `border-radius` | `20px` (`--r-card`) |
| Área de imagem | `height: 200px` · `border-radius: 20px 20px 0 0` · fundo `--cream-img` |
| Card body padding | `16px 18px 20px` |
| Sombra repouso | `0 10px 30px rgba(0,0,0,.05)` |
| Sombra hover | `0 20px 50px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.04)` |
| Hover | `translateY(-4px)` |
| Wishlist | Fixed `44×44px` · `border-radius: 100px` · constraint `Right/Top` · `top: 12px, right: 12px` |

## Elementos internos

- **Categoria** (`.card__category`): `9.5px / 600 / uppercase / tracking 0.08em` · cor `--t4`
- **Nome** (`.card__name`): `13.5px / 600 / line-clamp 3` · cor `--t9` · `min-height: calc(13.5px * 1.4 * 3)` — reserva 3 linhas
- **Variante** (`.card__variant`): `11px / 500` · cor `--t6` · sempre visível
- **Label preço** (`.card__price-label`): `10px / 400` · cor `--t4`
- **Preço principal** (`.card__price-main`): `20px / 700` · cor `--gdeep` · tracking `-0.02em`
- **Preço riscado** (`.card__price-old`): `12px / 400` · cor `#6B7280` · contraste 5.74:1 WCAG AA
- **Preço /kg** (`.card__price-unit-label`): `11px / 400` · cor `#374151` · contraste 9.2:1 WCAG AAA
- **Badge de desconto** (`.card__price-disc`): `11px / 600` · cor `--color-promo` · bg `--color-promo-bg` · `border-radius: 100px`
- **Bloco de preço** (`.card__price-block`): `min-height: 72px` — reserva altura do caso mais alto (com old + disc)
- **Spacer** (`.card__spacer`): `flex: 1` — empurra botão para base. **Nunca `margin-top` no botão**

## Badges sobre a imagem

- **Dieta** (`.badge--diet`): bg `--badge-diet-bg` · texto `--badge-diet-tx` · borda `--badge-diet-bd` · absoluto `top: 12px, left: 12px` · constraint `Left/Top`
- **Promoção** (`.badge--promo`): bg `#C0694A` · texto branco · **NUNCA `#E65100`**
- **Unidade** (`.badge--unit`): bg `--color-indigo-bg` · texto `--color-indigo`

## QuantitySelector — FECHADO

### Estado idle (default)

Botão retangular full-width com texto `+ Adicionar`

- `height: 40px` · `border-radius: --r-sel (10px)` · bg `--gd (#2C742F)` · texto branco
- Hover: `--ghover (#1A5C1E)`

### Estado active (após clicar em Adicionar)

Pill `[− | 100 gr | +]`

- Layout: `display: grid; grid-template-columns: 1fr 2fr 1fr`
    - Colunas −/+ iguais (1fr cada) · display central ocupa 2fr (dobro do espaço)
- `height: 40px` · `border-radius: --r-sel (10px)` · bg `--gd`
- `padding: 0 12px` — zona de segurança, ícones nunca tocam a borda arredondada
- Botões −/+: `justify-content: center` — simétricos sem margem manual
- Display central: `14px / 700` · cor `#fff` · contraste 7.1:1 WCAG AAA · **apenas quantidade, sem preço**
- Separadores: `border-left/right: 1px solid rgba(255,255,255,0.2)`

### Regras de negócio

- **Unidade: `gr`** — FECHADO (nunca `g`, nunca `gram`)
- Incremento: 100 gr · Mínimo: 100 gr · Sem teto máximo fixo
- Conversão automática: ≥ 1000 gr → kg com vírgula BR (`1 kg`, `1,5 kg`, `2 kg`)
- Regra: `1,0 kg` → `1 kg` · `1,50 kg` → `1,5 kg` (remove zeros desnecessários)
- `role="spinbutton"` + `aria-label="Quantidade em gramas"` + `aria-valuemin/max/now`
- Âncora de consumo: campo `usage_hint` opcional no banco — se vazio não aparece

### Variante Unidade (prateleira)

Mesmo layout · QuantitySelector incremento 1 · exibe `N un.`

## Estados obrigatórios (Figma Component Set)

`default` · `hover` · `out-of-stock` (overlay + disabled) · `low-stock` (badge "Últimas unidades") · `featured` (borda brand) · `discount` (badge %)

- `loading` → `ProductCardSkeleton` (componente separado)
- `empty` → `EmptyState` (componente separado)

## Anatomia de layers Figma

```
card (border-radius 20px · flex column)
├── card__img-wrap (height 200px · overflow hidden)
│   ├── card__badges (absolute · top 12px left 12px · constraint Left/Top)
│   └── card__wishlist (absolute · top 12px right 12px · 44×44 · constraint Right/Top)
└── card__body (padding 16px 18px 20px · flex column)
    ├── card__category (9.5px/600 · uppercase · --t4)
    ├── card__name (13.5px/600 · line-clamp 3 · min-height 3 linhas)
    ├── card__variant (11px/500 · --t6 · sempre visível)
    ├── card__price-block (min-height 72px · flex column)
    │   ├── card__price-label (10px · --t4)
    │   ├── card__price-row (flex · baseline)
    │   │   ├── card__price-main (20px/700 · --gdeep)
    │   │   └── card__price-old (12px · #6B7280 · line-through · só se promo)
    │   ├── card__price-unit-label (11px · #374151)
    │   └── card__price-disc (11px/600 · --color-promo · só se promo)
    ├── card__spacer (flex: 1)
    └── qty-wrap
        ├── [idle] qty-btn-add (height 40px · bg --gd · border-radius --r-sel)
        └── [ativo] qty-pill (grid 1fr 2fr 1fr · padding 0 12px · height 40px)
            ├── qty-pill__btn − (col 1 · justify center)
            ├── qty-pill__display (col 2 · 14px/700 · #fff · só quantidade)
            └── qty-pill__btn + (col 3 · justify center)
```

## Contraste WCAG — auditoria completa

| Elemento | Cor | Fundo | Contraste | WCAG |
| --- | --- | --- | --- | --- |
| Nome do produto | `#111827` | `#F9F5EF` | 17.5:1 | AAA |
| Variante | `#4B5563` | `#F9F5EF` | 7.2:1 | AAA |
| Preço principal | `#002603` | `#F9F5EF` | 19.8:1 | AAA |
| Preço riscado | `#6B7280` | `#F9F5EF` | 5.74:1 | AA ✅ |
| Preço /kg | `#374151` | `#F9F5EF` | 9.2:1 | AAA |
| Desconto | `#C0694A` | `#F9F5EF` | 4.6:1 | AA ✅ |
| Qty pill texto | `#ffffff` | `#2C742F` | 7.1:1 | AAA |
| Categoria | `#9CA3AF` | `#F9F5EF` | 3.2:1 | ⚠️ decorativo |

---

# Componentes Especiais — Detalhes Técnicos

## Navigation — Header 3 Camadas (195px total)

- **Top Bar (44px):** fundo `--gdeep` · horários · frete grátis + 10% 1ª compra
- **Middle Bar (93px):** Logo + busca 400px + botão Buscar (`--g`) + favoritos + carrinho com badge
- **Nav Bar (58px):** fundo `--gdeep` · links 13px/600 · ativos `#fff` · inativos `rgba(255,255,255,.65)`

## Hero Banner (container 1280×520px)

- Banner principal 836×520px + 2 banners 400×248px à direita · gap 24px
- Overlay: `linear-gradient(102.7deg, rgba(0,0,0,0.41) 10%, rgba(0,0,0,0) 59%)`
- Glassmorphism no card da imagem · blobs orgânicos via `radial-gradient` · traços SVG decorativos

## Trust Badges (4 itens)

Frete Grátis · Atendimento WhatsApp · Pagamento Seguro · Produtos Frescos

Container ícone: Fixed `40×40px` · ícone `24×24px` · título `14px/600` · subtítulo `12px/400`

## MiniCart Drawer

- Barra de frete reativa com ícone de caminhão animado · frete R$15 fixo · grátis ≥ R$100
- Banner dinâmico de parcelamento (threshold R$150 · índigo → verde)
- Overlay `rgba(0,0,0,.50)` ao abrir

## Checkout

- Floating labels nos inputs · grid de endereço proporcional
- Opção dinheiro + campo de troco animado · tiers de parcelamento visuais (2x/3x)
- Coluna lateral sticky com resumo reativo

## Seção Avaliações

- Carousel mobile: `scroll-snap-type: x mandatory` + JS vanilla ~30 linhas
- Badge "Comprador Verificado": bolinha `#2C742F` com check SVG branco `absolute bottom:-2px right:-2px`
- Aspas decorativas: `font-size: 3.5rem · color: rgba(44,116,47,.15)`
- Texto depoimento: `#374151` fixo — contraste WCAG 9.2:1
- Card resumo sticky `top: 88px` no desktop

## CategoryCard

- Ícone: círculo `60px` + fundo `#F0FDF4` + `stroke-width: 1.6` + hover `scale(1.1)`
- Card: `border-radius: 20px · box-shadow: 0 4px 20px rgba(0,0,0,.03)`
- Card "Ver tudo": borda tracejada `dashed rgba(0,178,7,.35)` + texto `--gd`
- Hover: `translateY(-10px)` + sombra `0 16px 48px rgba(0,38,3,.10)`

## OfertaCard

- Thumb `64px · object-fit: cover`
- Disc verde-lima `#D4F567` com texto `#1A3A00` — contraste ~11:1
- Quick Add: hover `--g` + `scale(1.12)` spring
- Countdown: glassmorphism + glow verde + pulse ring animation

## Modal/Popup de Captação (872×400px)

Imagem esquerda 408px + conteúdo direito · título 28px/700 · input email + botão Enviar

Trigger: 3s após primeiro acesso · `localStorage: granel_popup_shown`

---

# UX — Decisões Críticas

## Hierarquia de preço para granel

`R$ 12,90 / 100 gr` em destaque — total dinâmico abaixo com unidade sincronizada

## Checkout bifurcado

Se retirada selecionada → pular tela de endereço, ir direto ao pagamento

## Acessibilidade

- Contraste mínimo WCAG AA em todos os textos
- Focus visible: `outline: 2px solid #00B207; outline-offset: 2px`
- Alt text obrigatório no admin (campo não-opcional no CRUD)
- WCAG touch target mínimo: 44×44px em todos os elementos interativos

## Micro-interações

- Adicionar ao carrinho: spinner → checkmark → badge pulsa → retorna
- Barra de frete: `transition: width 0.4s ease-out`
- ProductCard hover: `translateY(-4px)` + zoom imagem `scale(1.03)`
- Skeleton loading durante fetch de produtos
- Toast notifications: bottom-right · 3s · slide-in da direita

## Empty States obrigatórios

- Busca sem resultado → sugestão de categorias
- Carrinho vazio → 4 produtos mais vendidos
- Lista de pedidos vazia → CTA para catálogo
- Filtro sem resultado → "Ampliar intervalo de preço"

## Padrão de 3 Estados

Todo feed, grid ou lista com dados assíncronos deve implementar:

1. **`isLoading`** → `<ProductCardSkeleton count={N} />`
2. **`isEmpty`** → `<EmptyState context="filter|search|cart|wishlist|orders" />`
3. **`data`** → componente real

---

# Seções da Homepage — Estrutura Aprovada

> Referência: `granel_home.html` aprovado.
> 

| # | Seção | Descrição |
| --- | --- | --- |
| 1 | TopBar | Fundo `--gdeep` · horários + frete grátis + 10% 1ª compra |
| 2 | Header | Logo + busca centralizada + carrinho + minha conta |
| 3 | Nav | Mega-menu: Por categoria · Todos os produtos · Preços Especiais · Mais vendidos |
| 4 | Hero Banner | Banner principal + 2 banners menores à direita · gradiente overlay |
| 5 | Categorias | Grid 6 colunas · 12 categorias + card "Ver tudo" com borda tracejada |
| 6 | Produtos em Destaque | Grid 4 colunas · ProductCard · estados: skeleton / empty / data |
| 7 | Diferenciais | Grid 3 colunas · ícone + título + texto · card central destacado |
| 8 | Ofertas Relâmpago | Banner lateral + countdown timer + 3 OfertaCards com quick-add |
| 9 | Marcas Parceiras | Slider horizontal de logos |
| 10 | Avaliações | Grid 4fr+8fr · resumo de rating + cards de reviews |
| 11 | Footer | 4 colunas: Sobre nós · Sua conta · Ajuda · Encontre · ícones de pagamento |

---

# Hierarquia de Headings — SEO e Acessibilidade

> Regra absoluta: 1 × H1 por página. Nunca pular níveis.
> 

| Página | H1 | H2 | H3/H4 |
| --- | --- | --- | --- |
| Home | Tagline na hero (1 único) | Categorias · Produtos em Destaque · Diferenciais · Marcas · Avaliações | H3: categoria destacada · H4: nome do produto |
| PDP | Nome do produto | Descrição · Informações Nutricionais · Produtos Relacionados | — |
| Categoria | Nome da categoria (dinâmico) | Filtros · Produtos | — |
| Checkout | Finalizar Compra | Entrega · Pagamento · Resumo do Pedido | — |

---

# Imagens de Produto

| Asset | Dimensão | Formato | Ferramenta |
| --- | --- | --- | --- |
| Original (foto) | 800×800px · fundo branco | PNG → WebP via script | Sharp |
| Thumbnail (card) | 400×400px | WebP automático | Script Sharp |
| Full (página produto) | 800×800px | WebP automático | Script Sharp |
| Banner hero principal | 856×520px | PNG Figma → WebP | Script Sharp |
| Banners menores | 400×248px | PNG Figma → WebP | Script Sharp |
| OG / WhatsApp | 1200×630px | WebP | Script Sharp |
| Logo | SVG | — | Figma export |
| Ícones de categoria | SVG | — | Figma export |
| Favicon | 32×32px + 180×180px PNG | — | Figma export |

**Nomenclatura:** slug automático da planilha. Ex: `CASTANHA DO PARÁ` → `castanha-do-para.webp`

---

# Componentes a Implementar — Pendentes

> ⚠️ Repositório recriado do zero em 15/05/2026. Todos os componentes partem de uma base limpa.
> 

| Arquivo | Status |
| --- | --- |
| `design-tokens.ts` | ✅ Implementado (src/lib/tokens.ts) |
| `cn.ts` | ✅ Implementado (src/lib/utils.ts) |
| `Button.tsx` — 5 variantes | ✅ Implementado |
| `Badge.tsx` | ✅ Implementado |
| `Input.tsx` | ✅ Implementado |
| `Card.tsx` | 🔴 Pendente |
| `QuantitySelector.tsx` | ✅ Implementado |
| `ProductCard.tsx` | 🟡 Parcial (fallback imagem + Bloco 9) |
| `ProductCardSkeleton.tsx` | ✅ Implementado |
| `EmptyState.tsx` — 5 contextos | ✅ Implementado |
| `Navigation.tsx` | 🟡 Parcial (Bloco 9) |
| `Footer.tsx` | 🟡 Parcial (Bloco 9) |
| `HeroBanner.tsx` | 🟡 Parcial (Bloco 9) |
| `TrustBadges.tsx` | ✅ Implementado |
| `CategoryGrid.tsx` | ✅ Implementado |
| `ProductGrid.tsx` | 🔴 Pendente |
| `FeaturedProducts.tsx` | ✅ Implementado |
| `NewsletterPopup.tsx` | 🔴 Pendente |
| `CartDrawer.tsx` | 🔴 Pendente |
| `CheckoutStepper.tsx` | 🔴 Pendente |
| `OrderTimeline.tsx` | 🔴 Pendente |
| `Modal.tsx` | 🔴 Pendente |
| `FidelityCard.tsx` | 🔴 Pendente |
| `AdminSidebar.tsx` | 🔴 Pendente |

---

# Telas — Sequência de Criação no Figma

| # | Tela | Canvas | Prioridade |
| --- | --- | --- | --- |
| 1 | 00_Tokens (página de design system) | — | PRIMEIRO |
| 2 | 01_Components (todos os componentes) | — | SEGUNDO |
| 3 | Homepage Desktop | 1440px | ALTA |
| 4 | Popup de Captação | 1440px | ALTA |
| 5 | Página de Categoria | 1440px | ALTA |
| 6 | Página de Produto | 1440px | ALTA |
| 7 | Carrinho (drawer) | 1440px | ALTA |
| 8 | Checkout 3 steps | 1440px | ALTA |
| 9 | Homepage Mobile | 390px | ALTA |
| 10 | Login/Cadastro | 1440px | MÉDIA |
| 11 | Minha Conta | 1440px | MÉDIA |
| 12 | Tablet (breakpoints) | 1024px | MÉDIA |

---

# Especificações para Figma via MCP

> Briefing técnico obrigatório para toda criação de componentes e telas no Figma via MCP. Sem estas especificações, a API do Figma posiciona elementos com coordenadas cegas, causando distorções e ícones fora de lugar.
> 

## Spacing Scale — Escala Canônica

> Base: múltiplos de 4px. Todo padding, gap e margin deve usar um destes valores — nunca valores arbitrários.
> 

| Token | Valor | Uso principal |
| --- | --- | --- |
| `--s1` | 4px | Separação mínima entre elementos inline |
| `--s2` | 8px | Gap interno de badges, gap ícone→texto em botão |
| `--s3` | 12px | Padding vertical de inputs, gap entre itens de nav, padding lateral do qty-pill |
| `--s4` | 16px | Padding interno de cards (mobile), gap entre cards mobile |
| `--s5` | 20px | Padding lateral de seções no mobile |
| `--s6` | 24px | Gutter do grid desktop, gap entre cards desktop |
| `--s8` | 32px | Padding vertical de seções menores |
| `--s10` | 40px | Padding vertical de seções padrão |
| `--s12` | 48px | Padding vertical de seções hero |
| `--s20` | 80px | Margem lateral do container desktop |

## Auto Layout — Regras por Tipo de Componente

> Regra global: **todo frame e componente usa Auto Layout**. Nenhum elemento filho posicionado manualmente com X/Y absoluto, exceto badges de posição absoluta declarados explicitamente.
> 

### Botões

- Direção: horizontal · Alinhamento: center/center · Padding: `12px 24px` · Gap ícone→label: `8px`
- Sizing: Hug width · Hug height
- Propriedades expostas: `label`, `icon` (boolean), `variant`, `size`, `state`

### Inputs

- Direção: horizontal · Alinhamento: center/start · Padding: `12px 16px` · Gap: `8px`
- Sizing: Fill width · Fixed height `48px`
- Propriedades expostas: `label`, `placeholder`, `state`, `icon-left`, `icon-right`

### Badge / Pill / Chip

- Direção: horizontal · Alinhamento: center/center · Padding: `4px 10px`
- Sizing: Hug width · Hug height · `border-radius: 100px`
- Propriedades expostas: `label`, `variant`

### ProductCard

- Frame externo: vertical · Hug width · Hug height · `border-radius: 20px`
- Imagem: Fixed `302px × 200px` · `border-radius: 20px 20px 0 0` · sem Auto Layout interno
- Body: vertical · `padding: 16px 18px 20px` · `gap: 6px` · Fill width
- Botão (idle): Fill width · Fixed height `40px` · `border-radius: --r-sel`
- Pill (ativo): Fill width · Fixed height `40px` · `grid 1fr 2fr 1fr` · `padding: 0 12px`
- **Badges sobre a imagem: posição absoluta** (ver Constraints)

### CategoryCard

- Frame externo: vertical · center/center · `padding: 20px 16px` · `gap: 12px`
- Container do ícone: Fixed `60×60px` · `border-radius: 30px` (**width = height SEMPRE**)
- Ícone interno: Fixed `28×28px` · constraint center/center

### TrustBadge

- Horizontal · center/center · `gap: 12px` · `padding: 16px 24px`
- Container do ícone: Fixed `40×40px` · **width = height obrigatório**
- Ícone: Fixed `24×24px` · constraint center/center

### Header (Middle Bar)

- Horizontal · center/center · `padding: 0 80px` · `gap: 24px`
- Logo: Hug width · Fixed height `44px` · constraint left/center
- Campo de busca: Fixed `400×44px` · constraint center/center
- Grupo direita: horizontal · `gap: 16px` · constraint right/center

### Nav Bar

- Horizontal · center/center · `padding: 0 80px` · `gap: 32px` · Fixed height `58px` · Fill width

### MiniCart Drawer

- Vertical · Fixed width `420px` · Fill height (100vh)
- Header: horizontal · space-between/center · `padding: 20px 24px` · Fixed height `64px`
- Lista: vertical · `gap: 16px` · `padding: 0 24px`
- Footer: vertical · `gap: 12px` · `padding: 20px 24px` · border-top `1px --bd`

### QuantitySelector

- **Idle:** Fill width · Fixed height `40px` · `border-radius: --r-sel` · **width canônico**
- **Active (pill):** Fill width · Fixed height `40px` · `border-radius: --r-sel` · `padding: 0 12px`
    - Grid: `1fr 2fr 1fr` — botões −/+ com `justify-content: center` (sem margem manual)
    - Display central: Fill height · separadores `border-left/right 1px rgba(255,255,255,0.2)`

### Footer

- Vertical · Fill width · `padding: 48px 80px`
- Grid de colunas: horizontal · `gap: 48px` · alinhamento start/start
- Cada coluna: vertical · `gap: 16px` · Fixed width `240px`

## Constraints — Regras por Tipo de Elemento

| Elemento | Constraint H | Constraint V | Observação |
| --- | --- | --- | --- |
| Container principal de página | Left & Right | Top | Sempre ocupa toda a largura |
| Seção de conteúdo | Center | Top | Centraliza no canvas |
| Logo no header | Left | Center | Ancora à esquerda |
| Campo de busca | Center | Center | Fica centralizado |
| Ícones de ação no header | Right | Center | Ancora à direita |
| Badge de notificação sobre ícone | Right | Top | Posição absoluta no canto |
| Badge de desconto sobre ProductCard | Right | Top | Absoluto · `top: 12px, right: 12px` |
| Badge de dieta sobre ProductCard | Left | Top | Absoluto · `top: 12px, left: 12px` |
| Wishlist sobre ProductCard | Right | Top | Absoluto · `top: 12px, right: 12px` |
| Imagem dentro do ProductCard | Left & Right | Top & Bottom | Stretch — preenche o frame |
| Ícone dentro de container circular | Center | Center | Centralização perfeita |
| Texto dentro de botão | Center | Center | Nunca Left |
| Overlay de imagem | Left & Right | Top & Bottom | Cobre toda a imagem |
| Barra de progresso (frete) | Left & Right | Center | Stretch horizontal |
| Coluna lateral sticky (checkout) | Right | Top | Ancora à direita |
| Botão de fechar modal/drawer | Right | Top | Sempre canto superior direito |

## Regra Crítica: Círculos Perfeitos no Figma via MCP

> `width` e `height` devem ter o **mesmo valor numérico** — nunca delegar ao Auto Layout calcular um deles.
> 

| Elemento | Tamanho fixo | Border-radius | Ícone interno |
| --- | --- | --- | --- |
| CategoryCard ícone container | 60 × 60px | 30px | 28 × 28px |
| TrustBadge ícone container | 40 × 40px | 20px | 24 × 24px |
| Wishlist no ProductCard | 44 × 44px | 100px | 16 × 16px |
| Badge de notificação (carrinho) | 18 × 18px | 9px | — (texto 10px) |
| Avatar de usuário | 36 × 36px | 18px | — (imagem) |
| Badge "Comprador Verificado" | 16 × 16px | 8px | SVG check 10px |

## Figma Properties Map — O que Expor por Componente

| Componente | Propriedades Figma | Tipo |
| --- | --- | --- |
| Button | `variant`, `size`, `state`, `label`, `has-icon` | Enum / Bool / Text |
| Input | `state`, `label`, `placeholder`, `has-icon-left`, `has-icon-right` | Enum / Bool / Text |
| Badge | `variant`, `label` | Enum / Text |
| ProductCard | `variant` (granel/unit), `state` (default/hover/out-of-stock/low-stock/discount/featured), `product-name`, `price`, `category`, `has-badge-diet`, `has-badge-promo` | Enum / Bool / Text |
| CategoryCard | `label`, `state` (default/hover/ver-tudo) | Text / Enum |
| QuantitySelector | `state` (idle/active), `value`, `unit` (gr/un) | Enum / Text |
| TrustBadge | `icon`, `title`, `subtitle` | Instance / Text |
| Header | `breakpoint` (desktop/tablet/mobile), `cart-count` | Enum / Text |
| Footer | `breakpoint` (desktop/tablet/mobile) | Enum |

## Layer Naming Convention — Nomenclatura Obrigatória

> Todos os layers em português, sem abreviações, sem espaços (usar hífen).
> 
- Frames de página: `Homepage-Desktop`, `Homepage-Mobile`, `Categoria-Desktop`
- Seções: `secao-hero`, `secao-categorias`, `secao-produtos-destaque`
- Componentes: `ProductCard`, `CategoryCard`, `Button-Primary`, `Input-Default`
- Variantes: separador `/` — `Button/Primary/Default`, `Button/Primary/Hover`
- Layers internos: `imagem`, `corpo`, `area-preco`, `badge-desconto`, `badge-dieta`, `botao-adicionar`, `container-icone`, `icone`, `label`, `sublabel`
- Estados: `estado=padrao`, `estado=hover`, `estado=sem-estoque`, `estado=carregando`

**Proibido:** `Frame 42`, `Group 7`, `Rectangle 3` · abreviações `btn`, `img`, `ctr`, `bg` · inglês misturado com português

## Responsividade — Regras por Breakpoint

### TopBar

| Desktop (1440px) | Tablet (1024px) | Mobile (390px) |
| --- | --- | --- |
| Texto completo dos dois horários + frete | Texto resumido — só frete grátis | Só ícone + "Frete grátis acima de R$100" |
| Height: 44px | Height: 44px | Height: 40px |

### Header

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| Logo + busca 400px + ícones | Logo + busca 280px + ícones | Logo + lupa + carrinho |
| Middle Bar 93px + NavBar 58px | Middle Bar 72px + NavBar 48px | Header único 60px |
| Mega-menu | Mega-menu | Menu hambúrguer |

### Hero Banner

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| Banner principal 836×520 + 2 menores à direita | Full width 976×400 + banners abaixo | Banner único full width × 240px |
| Gap: 24px | Gap vertical: 16px | Sem banners secundários |

### Grade de Categorias

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| 6 colunas · gap 24px · 180px | 4 colunas · gap 16px · 210px | 3 colunas · gap 12px · 100px |

### Grade de Produtos (ProductCard)

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| 4 colunas · 302px · gap 24px | 3 colunas · ~290px · gap 16px | 2 colunas · ~165px · gap 12px |
| Todos os elementos visíveis | Todos os elementos visíveis | line-clamp 2, preço/kg oculto |
| Botão: "+ Adicionar" (full-width) | Botão: "+ Adicionar" (full-width) | Botão: ícone `+` (40×40px) |

### Seção Diferenciais

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| 3 colunas · card central destacado | 3 colunas · card central destacado | 1 coluna (stack vertical) |

### Seção Ofertas Relâmpago

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| Banner lateral 30% + lista 70% | Banner lateral 30% + lista 70% | Banner oculto — só lista vertical |
| 3 OfertaCards horizontais | 3 OfertaCards horizontais | 3 OfertaCards verticais |

### Seção Avaliações

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| Grid 4fr + 8fr (card resumo sticky) | Grid 3fr + 9fr | Stack: resumo acima + carousel |
| 3 cards de review | 2 cards de review | Carousel snap (1 por vez) |

### Footer

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| 4 colunas + Instagram feed 6 thumbs | 2 colunas × 2 linhas · 4 thumbs | Stack vertical · sem Instagram feed |

### MiniCart Drawer

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| Lateral direita · 420px | Lateral direita · 380px | Bottom sheet · max-height 85vh |

### Checkout

| Desktop | Tablet | Mobile |
| --- | --- | --- |
| 2 colunas (60% form + 40% resumo sticky) | 2 colunas (65% + 35%) | 1 coluna · resumo colapsável no topo |

## Sequência de Criação no Figma — Protocolo MCP

**Etapa 1 — Página 00_Tokens**

1. Swatches de cor: retângulo `80×80px` por token, nomeado com o token CSS
2. Escala tipográfica: texto de exemplo para cada token
3. Escala de espaçamento: réguas visuais para cada valor
4. Border-radius: retângulos demonstrando cada valor canônico
5. Sombras: cards demonstrando cada shadow token
6. Grid: frame 1440px com grid de 12 colunas configurado

**Etapa 2 — Página 01_Components (átomos antes de moléculas)**

1. Ícones circulares (CategoryCard, TrustBadge) — resolver primeiro para evitar distorções
2. Badge / Pill (todas as variantes)
3. Button (5 variantes × 3 estados = 15 frames)
4. Input (4 estados)
5. QuantitySelector (2 estados: idle + active)
6. ProductCard (6 estados × 2 variantes granel/unit = 12 frames)
7. CategoryCard (3 estados)
8. TrustBadge · OfertaCard · Skeleton loaders · Empty states

**Etapa 3 — Páginas de tela**

Homepage Desktop → Popup → Categoria → Produto → Carrinho → Checkout → Mobile → Tablet

## Checklist de Qualidade por Componente (MCP)

- [ ]  Todos os frames com Auto Layout ativo
- [ ]  Containers circulares com `width === height`
- [ ]  Ícones com constraint `center/center` dentro do container
- [ ]  Badges de posição absoluta com constraints declarados (`Right/Top` ou `Left/Top`)
- [ ]  Nenhum layer com nome automático (`Frame N`, `Group N`, `Rectangle N`)
- [ ]  Propriedades Figma expostas conforme o Properties Map acima
- [ ]  Variantes nomeadas com separador `/`
- [ ]  Cores usando variáveis do arquivo (não hex hardcoded)
- [ ]  Tipografia usando estilos de texto do arquivo (não valores manuais)
- [ ]  `stroke-width: 1.6` em todos os SVGs

---

*Última atualização: 15/05/2026 · v3.1 — Repositório recriado do zero · `product_cards_v2.html` aprovado · QuantitySelector: `grid 1fr 2fr 1fr` + `padding: 0 12px` · Componentes marcados como pendentes*

[⚙️ Skill — granel-interface-design v1.0](%E2%9A%99%EF%B8%8F%20Skill%20%E2%80%94%20granel-interface-design%20v1%200%2034ff86ce18e58108b836f3905d5e6141.md)