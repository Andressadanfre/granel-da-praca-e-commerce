# 🗺️ 00 — Mapa do Projeto

> **Documento vivo.** Atualizar ao final de cada sessão. Responde em 30 segundos "onde estou" sem ler o log completo.
> 

---

# ✅ Estado Atual — 18/05/2026

Repositório limpo. 16 componentes entregues e commitados. Build 100% limpo.

- **Repo:** `github.com/Andressadanfre/granel-da-praca-e-commerce`
- **Pasta:** `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce`
- **Supabase:** `ymjmgukuojwumvtaglyp` — São Paulo — **tabelas ainda não aplicadas**
- **`.env.local`:** ✅ preenchido
- **`npm run dev`:** ✅ compilando sem erros
- **Tailwind:** v3 confirmado
- **Último commit:** `fed7db1` — Footer.tsx + NewsletterForm.tsx

---

# 🔴 Próximo Passo

`HeroBanner.tsx` → `src/components/sections/HeroBanner.tsx`

Referência: `granel_home.html` aprovado — seção Hero (~linha 1491). Solicitar o arquivo antes de gerar qualquer TSX. Verificar divergências com DS v3.1 antes de codificar.

---

# Rotas — Status

| Rota | Status |
| --- | --- |
| `/` | 🔴 Pendente |
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
| `Badge.tsx` | `src/components/ui/Badge.tsx` | ✅ 6 variantes |
| `Input.tsx` | `src/components/ui/Input.tsx` | ✅ floating label |
| `QuantitySelector.tsx` | `src/components/ui/QuantitySelector.tsx` | ✅ granel/unit |
| `Card.tsx` | `src/components/ui/Card.tsx` | 🔴 Pendente |
| `Modal.tsx` | `src/components/ui/Modal.tsx` | 🔴 Pendente |

## Produto

| Componente | Arquivo | Status |
| --- | --- | --- |
| `ProductCard.tsx` | `src/components/product/ProductCard.tsx` | ✅ 5 estados · 2 variantes |
| `WishlistButton.tsx` | `src/components/product/WishlistButton.tsx` | ✅ Client Component autônomo |
| `AddToCartSelector.tsx` | `src/components/product/AddToCartSelector.tsx` | ✅ Client Component autônomo |
| `ProductCardSkeleton.tsx` | `src/components/product/ProductCardSkeleton.tsx` | ✅ shimmer CSS puro · prop count |
| `EmptyState.tsx` | `src/components/product/EmptyState.tsx` | ✅ 5 contextos |

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
| `HeroBanner.tsx` | `src/components/sections/HeroBanner.tsx` | 🔴 **PRÓXIMO** |
| `TrustBadges.tsx` | `src/components/sections/TrustBadges.tsx` | 🔴 Pendente |
| `CategoryGrid.tsx` | `src/components/sections/CategoryGrid.tsx` | 🔴 Pendente |
| `FeaturedProducts.tsx` | `src/components/sections/FeaturedProducts.tsx` | 🔴 Pendente |
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
- [ ]  Aplicar schema SQL no Supabase (tabelas ainda não criadas)
- [ ]  Conectar Vercel ao novo repo `granel-da-praca-e-commerce`
- [ ]  Apagar projeto antigo no Vercel (fazer manualmente em [vercel.com/settings](http://vercel.com/settings))

---

# ⚠️ Lições Permanentes

| Erro | Solução |
| --- | --- |
| Commit vazio (blob e69de29) | `git diff --staged --stat` antes de todo commit |
| Portas 3000/3001 ocupadas | `taskkill /F /IM node.exe`  • `Remove-Item -Recurse -Force .next` |
| Server Component com onClick | Extrair em Client Component separado (padrão WishlistButton) |
| Badge children type error | Template literal `{\`${n}% OFF`}` nunca JSX com number |
| Cursor adiciona código não solicitado | Sempre passar arquivo completo + verificar antes de testar |
| `@supabase/auth-helpers-nextjs` | Usar `@supabase/ssr` |

---

*Última atualização: 18/05/2026 · Sessão 030 — Navigation + Footer entregues · Próximo: HeroBanner.tsx*