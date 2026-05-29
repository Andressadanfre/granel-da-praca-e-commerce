# ⚙️ 6 — Configuração do Cursor

> **Briefing de retomada para o Cursor.** Leia este documento + 🗺️ 00 — Mapa do Projeto antes de qualquer ação. Conteúdo: apenas decisões fechadas e o estado atual. Histórico de sessões fica em 📍 04 — Log de Desenvolvimento.
> 

---

# ✅ Estado Atual — 15/05/2026

Repositório recriado do zero. Scaffold limpo rodando.

| Item | Valor |
| --- | --- |
| Repositório | `Andressadanfre/granel-da-praca-e-commerce` |
| Pasta local | `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce` |
| Branch principal | `master` |
| Next.js | 14 App Router — `npm run dev` ✅ rodando |
| Tailwind | v3 — downgrade aplicado |
| Último commit | `feat: scaffold inicial — Next.js 14, Tailwind v3, DS v3.1 tokens` |

**Próximo passo:** implementar `design-tokens.ts` → `cn.ts` → `Button.tsx` na ordem da tabela de pendentes do Notion DS v3.1.

---

# Decisões Técnicas Fechadas — Não Reabrir

| Decisão | Valor |
| --- | --- |
| Framework | Next.js 14 App Router — nunca Pages Router |
| Tailwind | v3 — nunca v4 |
| Componentes | Design system próprio — sem shadcn/ui no Granel |
| Fonte | Poppins exclusivamente via `next/font` |
| Unidade de peso | `gr` — nunca `g` |
| Background | `#F9F5EF` cream — nunca branco puro |
| CTA principal | `#00B207` — exclusivo para Finalizar/Buscar/Confirmar |
| Botão carrinho | `#2C742F` — Adicionar ao carrinho |
| Hover todos os CTAs | `#1A5C1E` — token único `--ghover` |
| Badge promo | `#C0694A` terracota — nunca `#E65100` |
| stroke-width SVGs | `1.6` — único em todo o projeto |
| Ícones Lucide | `strokeWidth={1.6}` — nunca filled |
| Datas | `YYYY-MM-DD` no banco · `DD/MM/AAAA` na UI |
| Moeda | Centavos (int) no banco · BRL na UI |
| Soft delete | `is_deleted = true` — nunca DELETE físico |
| Supabase tabela usuários | `app_users` — nunca `profiles` |
| Supabase client | Lazy initialization — nunca no top-level de módulo |
| Filtros `/loja` | URL params (Server Component) — decisão SEO fechada |
| Terminal | PowerShell only — nunca bash |
| Commits | Sempre como `Andressadanfre` em português |

---

# Referências Rápidas

| Item | Valor |
| --- | --- |
| Repositório | `Andressadanfre/granel-da-praca-e-commerce` |
| Pasta local | `C:\Users\Dell\Documents\projetos\granel-da-praca-e-commerce` |
| Supabase projeto | `ymjmgukuojwumvtaglyp` (São Paulo) |
| Figma arquivo | `8W0t6viqI7UlqqlsFrPb6C` |
| Vercel landing (não mexer) | `graneldapraca-landing` → `www.graneldapraca.com.br` |
| Meta Pixel | `2291807841017792` |
| Google Ads conta | `760-664-9903` |
| GA4 | `G-C6W30XMXN3` |

---

# Arquivos criados no scaffold

| Arquivo | Descrição |
| --- | --- |
| `src/lib/tokens.ts` | Design tokens DS v3.1 — cores, radius, sombras, ease |
| `src/lib/supabase.ts` | `getSupabase()` e `getSupabaseServer()` — lazy init |
| `src/lib/utils.ts` | `cn()`, `formatBRL()`, `formatGrams()`, `formatDate()` |
| `tailwind.config.ts` | Tokens do DS v3.1 extendidos no Tailwind |
| `.cursor/rules/granel-ecommerce.mdc` | Regras permanentes para o Cursor |
| `.env.local` | Variáveis de ambiente — ✅ keys do Supabase preenchidas |

> ✅ `.env.local` preenchido com as keys do projeto `ymjmgukuojwumvtaglyp`.
> 

---

# Padrões de Código Obrigatórios

- TypeScript strict — zero `any`, zero campos obrigatórios sem fallback
- Funções puras fora do componente (ex: `getCategoryGradient`, `formatBRL`)
- Tailwind v3 para layout + `style` prop para valores exatos do design system
- Imports: React → libs externas → componentes internos → tipos → utils
- Zero `console.log` no código commitado
- `next/image` obrigatório — nunca `<img>` puro
- Server Components como padrão — `'use client'` apenas para interatividade real

---

*Atualizado em 15/05/2026 · Sessão 026 — Repositório recriado do zero*