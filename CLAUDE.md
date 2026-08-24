# CLAUDE.md — Granel da Praça E-commerce

> Lido automaticamente a cada sessão. Contém APENAS invariantes do projeto.
> Estado de implementação NUNCA vive aqui — desatualiza e gera divergência.

---

## Identidade e Stack

E-commerce próprio da Granel da Praça — produtos naturais a granel desde 2019, duas unidades em Uberlândia, MG. Substituirá o Goomer e o site institucional no lançamento.

| Tecnologia | Versão | Regra |
|---|---|---|
| Next.js | 14.2.x | App Router — **nunca** Pages Router |
| Tailwind CSS | v3.4.x | **nunca** v4 |
| TypeScript | strict | zero `any`, `as any`, `@ts-ignore` |
| Supabase | `@supabase/ssr` | **nunca** `auth-helpers-nextjs` |
| Framer Motion | v12 | `ease` como `[n,n,n,n]` tuple — nunca `number[]` |

- Design system próprio (DS v3.1) — **sem** shadcn/ui. Tokens em `tailwind.config.ts` e `.cursor/rules/granel-ecommerce.mdc`.
- Gateway de pagamento DEFINITIVO: **Mercado Pago**. Referências a "Asaas" em docs antigos estão erradas — ignorar.
- Admin em `src/app/admin/` (sem route group) no **mesmo** projeto — parênteses removeriam o prefixo `/admin` da URL e quebrariam o middleware RBAC. Decisão fechada.
- Área logada do cliente: **`/conta`** (pedidos + dados numa única página). Login/cadastro em `/conta/login` e `/conta/cadastro`.

---

## Hierarquia de Verdade

| Assunto | Fonte de verdade |
|---|---|
| Schema do banco | `supabase/migrations/` (baseline `20260626000000`) + verificação via Supabase MCP |
| Estado de implementação, fases, pendências | **Topo do log no Notion Mapa do Projeto — nunca este arquivo** |
| Layout visual | HTML aprovado em `html-referencias/` — sem HTML aprovado, não implementar |
| Marketing, analytics, runbooks de lançamento | Notion (Módulos 5 e 7 · página Site Institucional & Marketing) |
| Segurança (specs completas) | `.cursor/rules/granel-security.mdc` |
| Design, domínio e-commerce, padrões Next.js | `.cursor/rules/granel-ecommerce.mdc` |
| Componentes existentes | `git ls-files` — nunca inventário em documento |

---

## Regras Críticas

### Fórmula de preço — COMPLETA (fonte do erro 10x)

- `products.price_cents` = preço por **KG** em centavos. Não existe `price_per_100g_cents` — nunca usar.
- **Total do item (centavos):** `Math.round(price_cents * quantity_grams / 1000)`
- **Preço exibido por 100 gr:** `Math.round(price_cents / 10)` — dividir por 100 gera o **erro 10x** já cometido neste projeto.
- `increment_grams` é **APENAS** o step do QuantitySelector (100 granel / 1 unit). **NUNCA** é divisor de preço — usá-lo no cálculo é a outra forma do erro 10x. Seu único papel server-side é validação de múltiplo: `quantity_grams % increment_grams === 0`.
- Preço SEMPRE recalculado server-side a partir do banco — nunca aceitar preço do body da requisição.

### Shipping cost — CRITICAL (bug duplicado em 3 arquivos, 13/07)

- Qualquer cálculo de frete deve checar `deliveryType === 'retirada'` → 0.
- **NUNCA** duplicar a fórmula em múltiplos arquivos (`actions.ts`, `OrderSummaryPanel.tsx`, `schemas.ts` já tiveram cópias divergentes).
- `calcFreteServer` deve ser a única fonte de verdade — considerar exigir `deliveryType` como parâmetro obrigatório.

### Mercado Pago auto_return

- Obrigatório `'approved'` condicional a `appUrl.startsWith('https')` — MP rejeita `auto_return` com `back_url` localhost.
- Só dispara redirect automático para pagamento aprovado com **CARTÃO** — Pix nunca aciona, é comportamento nativo do MP, não bug.

### Mercado Pago produção — CRITICAL

- Prefixo `APP_USR-` no token **NÃO** garante que a conta está habilitada para transações reais.
- Confirmar sempre via painel de desenvolvedor (developers panel → Credenciais de produção) que o formulário de ativação (setor + site + termos) foi completado.
- Sintoma de conta não ativada: erro `'uma das partes é de teste'` mesmo com cartão real.

### Estoque — stock_status NÃO bloqueia compra (27/07/2026)

- `products.stock_status` (`in_stock`/`low_stock`/`out_of_stock`) é calculado automaticamente por trigger (`recalculate_stock_status`), mas **não impede adicionar ao carrinho nem finalizar checkout** — `AddToCartSelector.tsx` e o fluxo de checkout não checam esse campo.
- Risco real: cliente pode comprar produto com `out_of_stock` sem nenhum bloqueio do sistema.
- Bloqueio de compra por estoque é pendência não implementada — antes de assumir que existe proteção, confirmar no código.
- **(27/07/2026 → atualizado)** Padrão de `stock_status` quando a quantidade (`stock_quantity_grams`/`stock_quantity_units`) é `NULL` mudou de `low_stock` para **`in_stock`** via migration `fix_stock_status_null_default_to_in_stock` (aplicada via Supabase MCP). Com quantidade real preenchida, o trigger `recalculate_stock_status` continua funcionando pelos limiares normais (baixo→`low_stock`, zero→`out_of_stock`, acima do limiar→`in_stock`) — validado empiricamente. `low_stock`/`out_of_stock` só ocorrem quando já há quantidade real registrada.
  - **Por quê:** disponibilidade real é controlada manualmente via `is_active` até a integração com o Explend — `stock_status` com quantidade `NULL` não deve mais ser tratado como "requer revisão manual".
  - Na UI do admin (`src/app/admin/produtos/page.tsx`), quando `stock_status === 'in_stock'` e a quantidade real é `NULL`, o badge mostra "Disponível · não conferido" (mesma cor verde de `in_stock`) para sinalizar que a quantidade nunca foi conferida manualmente, sem tratar isso como alerta de estoque.

### RBAC do Admin — allowlist, não denylist

- O middleware (`src/middleware.ts`) bloqueia por **allowlist**: toda rota nova sob `/admin/*` é **negada por padrão** para role `supervisora` até ser explicitamente adicionada em `isAllowedArea` (hoje: `startsWith('/admin/produtos')` e `startsWith('/admin/pedidos')`).
- Ao criar uma rota nova sob `/admin/*` que a Supervisora deve acessar (ex: futuro `/admin/clientes` se o escopo dela mudar), é preciso atualizar `isAllowedArea` no middleware — a rota não herda acesso automaticamente só por existir.
- Sidebar (`src/app/admin/layout.tsx`, `buildNavSections`) segue o mesmo padrão: `ownerOnly` por item/seção, não o inverso. Rota nova sem marcação explícita fica visível por padrão — o middleware é a camada que realmente bloqueia, a sidebar é só UX.
- Consequência prática já confirmada: supervisora é redirecionada automaticamente de `/admin` (dashboard) para `/admin/produtos` (`isHomeRoot` no middleware). Qualquer feature nova que precise ser editável por owner e supervisora não pode ficar no dashboard — precisa entrar em `/admin/produtos` ou `/admin/pedidos` (as duas áreas liberadas), ou o middleware precisa ser alterado deliberadamente (decisão de escopo, não default).

### Padrões Supabase

- Projeto: `ymjmgukuojwumvtaglyp` (São Paulo). Env vars: `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY`.
- Helpers — nunca instanciar client no top-level:
  - `getSupabaseServer()` de `@/lib/supabase/server` — Server Components, Server Actions, Route Handlers
  - `getSupabase()` de `@/lib/supabase/client` — Client Components
  - `getSupabaseAdmin()` de `@/lib/supabase/server` — bypass RLS, **nunca** em Client Components ou rotas públicas
- Tabela de usuários: `app_users` — **nunca** `profiles`.
- Campos que **NÃO EXISTEM** (proibido inventar): `price_per_100g_cents` · `is_deleted` em `categories` (usa `is_active`) · `display_order` (usa `sort_order`).
- Soft delete: `is_deleted = true` em `products` — nunca `DELETE` físico.
- Datas: `YYYY-MM-DD` no banco · `DD/MM/AAAA` na UI. Monetário: centavos (`int`) no banco · `formatBRL(cents)` na UI.
- IDs internos de `categories`/`products` são `integer serial`; `orders`/`payments` expostos em URL são UUID.
- Após migration via MCP: regenerar `src/types/database.ts` com `npx supabase gen types typescript --project-id ymjmgukuojwumvtaglyp --schema public` (preservar helper `Tables<T>`).
- Verificar schema via MCP antes de escrever qualquer query.
- **GRANT por operação não é automático** (descoberto na Fase 2 do admin — primeira escrita em `products`): `service_role` pode ter `SELECT` numa tabela há anos e mesmo assim **não** ter `UPDATE`/`INSERT`/`DELETE`. GRANT é por operação, não implícito. Antes de qualquer Server Action nova que vá **escrever** numa tabela que até então só era lida pelo admin, confirmar via SQL (`information_schema.role_table_grants`) se `service_role` tem a permissão necessária — **nunca** assumir que vai funcionar só porque a leitura já funciona. Bypass de RLS (`rolbypassrls`) ≠ permissão de tabela.
- **GRANT em sequences:** GRANT de `INSERT`/`UPDATE` numa tabela **NÃO** concede automaticamente `USAGE` na sequence que gera o ID (coluna serial/identity). Toda tabela nova onde o `service_role` precisa fazer `INSERT` gerando ID automático exige checar/aplicar `GRANT USAGE, SELECT ON SEQUENCE` separadamente do GRANT da tabela — não assuma que está incluso.
- **`revalidatePath` por rota afetada** (mesmo contexto Fase 2): chamar `revalidatePath` para **cada** rota que precisa refletir o dado atualizado — não só a listagem-pai. Uma Server Action que atualiza um recurso e depois redireciona/refresh para a **mesma** página que iniciou a edição precisa de `revalidatePath` específico dessa rota também; sem isso, o Next pode servir cache do cliente mesmo com `router.push`/`router.refresh`. **Reincidência confirmada (08/08):** o mesmo padrão de bug se repetiu em `/admin/pedidos/[id]` — página sem `export const dynamic = 'force-dynamic'` + `markItemSeparated` sem `revalidatePath` da rota de detalhe = checkbox de separação desatualizado em produção mesmo com o banco correto. Antes de criar qualquer página nova de **detalhe** (não-listagem) no admin, checar as duas coisas juntas: a página tem `force-dynamic` (comparar com as rotas irmãs) E toda Server Action que a modifica revalida o path específico dela, não só o da listagem.
- **Fonte única de dado (evitar leitura de campo obsoleto):** ao adicionar um campo novo a uma tabela que substitui uma fonte de dado antiga (ex: campo direto substituindo uma tabela relacionada, ou um novo formato substituindo um antigo), sempre grep pelo nome da fonte **antiga** em todo o projeto antes de considerar a migração completa — não assuma que só o lugar óbvio (ex: um único componente) precisa ser atualizado. Na Fase 3, a troca de `product_images` para `products.image_url` exigia atualizar 6 lugares diferentes (ProductCard, PDP, produtos relacionados, ofertas, e o reorder do carrinho) — todos long-lived e silenciosamente desatualizados, sem gerar nenhum erro, só dado errado (placeholder de 'sem foto' mesmo com foto salva).
- **`process.env` dinâmico não funciona em Client Components:** `process.env[nomeVariavel]` (acesso via string/variável) não é substituído pelo webpack no bundle do browser — só `process.env.NEXT_PUBLIC_X` (acesso estático, literal) é injetado em build time. Um `requireEnv(name: string)` genérico que faz `process.env[name]` internamente funciona em Server Components/Actions (Node real) mas quebra silenciosamente em qualquer client (`getSupabase()`, ou futuro código client-side) — sempre passe o valor já resolvido estaticamente pra função de validação, nunca o nome da variável.

### Observabilidade e Rate Limiting

- Erros de servidor devem ser reportados ao Sentry via `Sentry.captureException()` além do `logger` Pino — os dois não são substitutos um do outro (Pino é log estruturado local/Vercel, Sentry é alerta + agregação).
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` são env vars obrigatórias em produção (Vercel) — sem elas, build ainda passa mas Sentry/rate limit ficam mudos silenciosamente.
- `experimental.instrumentationHook: true` é **obrigatório** em `next.config.mjs` enquanto o projeto estiver em Next.js 14.x — removido automaticamente só a partir do 15.
- Endpoints públicos sensíveis (webhooks, formulários sem auth) devem ter rate limiting via `Ratelimit` do Upstash (`src/lib/rate-limit.ts` é o padrão de referência) — checagem sempre como primeira validação da rota, antes de qualquer verificação de assinatura/payload.
- CSP (`next.config.mjs`) deve incluir o domínio de ingest do Sentry (`https://*.ingest.us.sentry.io`) no `connect-src` sempre que o Sentry client-side estiver ativo — esquecer isso faz o browser bloquear o envio de erros silenciosamente, sem erro visível no console além do log de CSP.

### Webhooks — idempotência e precedência de status (padrão, 12/08/2026)

- Webhook que atualiza status de um recurso (ex: `payment_status` de `orders`) nunca deve fazer `UPDATE` incondicional — webhooks podem chegar duplicados ou fora de ordem.
- Padrão adotado: RPC atômica (`SECURITY DEFINER`) que condiciona o `UPDATE` a uma hierarquia de precedência do status (rank numérico via `CASE`) dentro do próprio SQL — nunca `SELECT` + `UPDATE` separados no Node, que cria race condition entre webhooks concorrentes.
- Referência: `update_order_payment_status` (`orders.payment_status`) — `pendente`/`falhou` (rank 0) → `pago` (rank 1) → `reembolsado` (rank 2). A RPC retorna `updated` e `order_found` separadamente, para o handler distinguir "recurso não existe" de "update bloqueado por precedência" no log — nunca colapsar os dois casos na mesma mensagem.
- Índice `UNIQUE` parcial (`WHERE campo IS NOT NULL`) é o padrão para IDs externos (ex: `mp_payment_id`) que devem ser únicos mas frequentemente `NULL` antes de um evento externo confirmar.

### Fronteiras Server/Client (RSC)

- Server Component por padrão — `'use client'` **apenas** para `useState`/`useEffect`/event handlers/browser APIs.
- `getSupabaseAdmin()` jamais importado em arquivo `'use client'`.
- Mutações autenticadas: Server Actions — nunca Route Handlers.
- Identidade sempre via `supabase.auth.getUser()` no servidor — nunca `user_id` vindo do cliente. Queries sensíveis incluem `.eq('user_id', user.id)`.

### Minha Conta — status e timeline

- Tokens âmbar oficiais do DS (Notion): `warning-bg` `#FFF7E6` · `warning-text` `#B45309` · `warning-dot` `#F59E0B` — usados em `saiu_para_entrega` / `pronto_para_retirada` na UI da conta.
- Paleta de badges de status da **conta ≠ admin**: divergência **intencional** (expectativa do cliente vs operacional). Não alinhar as duas sem revisitar a decisão no Design System do Notion.
- `OrderTimeline` vive em `src/components/order/OrderTimeline.tsx` — compartilhado entre `/pedido/[token]` e o card expandido de `/conta`. Reuso 1:1 (sem `variant`) até haver necessidade visual.

### Filtros de data em telas administrativas — padrão "sempre" como default

- Ao implementar filtro de período/data em qualquer lista administrativa nova, NUNCA usar um período restrito (ex: "hoje") como filtro padrão se a lista pode conter itens de pipeline ativo/pendente (não finalizados) — fazer isso esconde itens antigos ainda pendentes da visão padrão, criando risco operacional (o operador pode achar que não há pendências quando há).
- Confirmado em /admin/pedidos (13/08/2026): filtro padrão mudou de periodo='hoje' para periodo='sempre' após teste real revelar pedidos 'recebido' de dias anteriores escondidos da lista principal, divergindo da contagem do badge do sidebar.
- Regra geral: resumos/contadores do tipo "X hoje" no header podem e devem continuar filtrados por hoje — é o filtro da LISTA principal que não deve ter esse padrão restritivo quando a lista mistura itens finalizados e pendentes.

---

## Workflow de Desenvolvimento

### Fluxo iterativo (padrão deste projeto)

```
Ler arquivo(s) → Diagnóstico → Aguardar aprovação → Código → Build → Commit
```

- Ler os arquivos alvo em disco antes de propor código — nunca editar de memória.
- Nunca reescrever arquivos inteiros — apenas snippets alterados.
- Nunca inventar layout — todo componente visual parte do HTML aprovado em `html-referencias/`.
- Mostrar diff para aprovação antes de `git add`.
- Diff mostrado para aprovação deve ser **output bruto do terminal** (`git diff` real) ou o **arquivo completo lido do disco** — nunca resumo com `// ... comentário do que mudou ...` no lugar do código real. Resumo não é verificável e já causou retrabalho neste projeto (sessão de 08/08).
- `npm run build 2>&1` antes de todo commit — zero erros TypeScript.

### Proibido sem aprovação explícita

- Criar/alterar arquivos em `supabase/migrations/`
- SQL destrutivo (`DELETE`, `DROP`, `TRUNCATE`) · `UPDATE`/`DELETE` sem `WHERE`
- Instalar novas dependências
- Commitar com build quebrado

### Commits

```
Formato:  tipo(escopo): descrição em português
Autor:    Andressadanfre
Tipos:    feat · fix · refactor · chore · docs
Exemplo:  feat(loja): adicionar filtro por categoria com URL state
```

`git diff --staged --stat` antes de todo commit — apenas os arquivos esperados no stage.

---

## Code Standards

- Estilos: classes Tailwind sempre — `style` prop **apenas** para valores dinâmicos de runtime (ex: `width: ${progress}%`).
- Cores: token semântico (`text-t5`) — nunca hex hardcoded nem `text-[#...]`. Hex sem token: constante nomeada e documentada.
- Escala Tailwind antes de valor arbitrário: `text-sm`, não `text-[14px]`.
- Classes condicionais: sempre `cn()` de `@/lib/utils` — nunca `.filter(Boolean).join(' ')`.
- Zero `console.*` commitado — usar `logger` de `src/lib/logger.ts`.
- `next/image` obrigatório — nunca `<img>` puro.
- Imports: React/framework → libs externas → componentes internos → tipos → utils.
- Funções puras fora do componente (`formatBRL`, `formatGrams` em `src/lib/utils.ts`).
- Unidade de peso: `gr` — nunca `g` ou `gram`.
- Error handling: Server Actions retornam `{ success, error }` tipado — nunca expor `error.message`/stack ao cliente.
- Nunca usar spread sobre `Set`/`Map` (`[...new Set(x)]`) — sempre `Array.from(new Set(x))`. Projeto não tem `downlevelIteration` habilitado no tsconfig; spread sobre iteráveis não-array quebra o build.
- Toggle/switch customizado: o `ToggleSwitch` (inline em `ProductEditForm.tsx`) usa `left-[3px]` explícito no `<span>` do knob — **nunca** `left` implícito/`auto`. Motivo: `left: auto` resolvido pelo browser somado a `translate-x` fixo fazia o knob overflowar o trilho. Qualquer toggle novo deve seguir `left` explícito + `translate` calculado a partir dele.
- **Campos NOT NULL com DEFAULT no banco:** ao montar payload de `INSERT`/`UPDATE`, nunca envie `null` para uma coluna `NOT NULL` com `DEFAULT` só porque o valor é "irrelevante" pro contexto atual (ex: campos que só fazem sentido para um `productType` específico) — o Postgres vai rejeitar. Omita o campo do objeto de payload (spread condicional) para deixar o banco aplicar seu `DEFAULT` na criação, ou preservar o valor já existente na edição.
- **Logging em dev:** nunca use transport assíncrono (worker thread) do Pino em dev — é frágil com Next.js/Webpack e pode morrer silenciosamente, mascarando o erro real que estava tentando logar. Use stream síncrono (`pino-pretty` como stream direto, sem `transport`) em dev. Produção continua sem pretty (JSON puro). `logWithSanitize` (ou equivalente) deve sempre ter `try/catch` — uma falha de logging nunca pode derrubar o fluxo principal da aplicação.
- **Cupom impresso (`/admin/pedidos/[id]/imprimir`):** o checkbox de separação por item reflete `order_items.is_separated` **no momento da impressão** — é estado do banco, não uma caixa em branco para marcar à mão. Decisão de design intencional, documentada no HTML aprovado (`docs/admin-layouts/admin-08-cupom-separacao.html`). Não "corrigir" isso para caixa vazia sem revisitar a decisão.
- **TODO — texto amigável de status de pagamento:** a função que traduz `payment_status`/`payment_method` em texto legível (ex: "Pago e confirmado", "A receber na retirada") hoje só existe local ao componente do cupom (`getPagamentoStatusTexto` em `src/app/admin/pedidos/[id]/imprimir/page.tsx`). A lista de pedidos (`/admin/pedidos`) ainda mostra o valor cru do banco (`pendente`/`pago`/`reembolsado`). Se for reaproveitar essa lógica em outro lugar, mover para `src/lib/utils.ts` (ou local equivalente de funções puras já usado no projeto) — não duplicar a função em um terceiro arquivo.
- **Serialização de erro do Supabase:** `PostgrestError` do Supabase é objeto plano, não instância de `Error` nativa do JS — serialização de erro para log precisa extrair `message`/`code`/`details`/`hint` explicitamente, ou produz `[object Object]` e mascara a causa real.
- `flex-1` + `overflow-y-auto` num item de flex column sempre precisa de `min-h-0` explícito — sem isso, `min-height: auto` (default do CSS) impede o item de encolher abaixo do conteúdo, e o scroll não funciona de verdade (conteúdo vaza visualmente em vez de rolar). Padrão obrigatório em qualquer drawer/painel com lista rolável + rodapé fixo.
- Ao adicionar campo `required` (sem `.default()`) a um schema Zod usado por uma Server Action já existente, sempre `grep` todos os componentes que chamam essa action e confirmar que o campo novo é de fato enviado no payload — schema mudou sozinho já quebrou 100% dos cadastros manuais silenciosamente (campo `termsAccepted` adicionado ao `signupSchema` sem o form nunca ter sido atualizado pra enviá-lo; erro genérico "Dados inválidos." escondeu a causa por tempo indeterminado).

---

## PowerShell (terminal deste projeto)

- PowerShell 5.1 — nunca bash/sh. Encadeamento: `A; if ($?) { B }` — `&&` não existe no PS 5.1.
- `distDir` separado por ambiente (`next.config.mjs`): dev escreve em `.next-dev`, build/produção em `.next`. `npm run dev` e `npm run build` convivem em paralelo sem corromper cache — não é mais necessário matar o dev server antes de buildar.
- Cache corrompido por outro motivo (ex: processo zumbi preso na porta): `npm run build:clean` ou `taskkill /F /IM node.exe` → `Remove-Item -Recurse -Force .next`/`.next-dev` → `npm run dev`.
- Porta 3000 travada por processo órfão (comum ao fechar aba do terminal do Cursor sem `Ctrl+C` antes): `predev` já roda automaticamente `scripts/check-port.js` a cada `npm run dev`, liberando a porta sozinho — não precisa mais matar processo manualmente antes de subir o dev.

---

## Checklist Pré-Commit

- [ ] Zero `console.*` — `Select-String -r "console\." src/` (ok para ASCII puro; não confiável em conteúdo acentuado — usar `Get-Content -Raw`)
- [ ] Zero `as any` / `as unknown as` / `@ts-ignore` sem justificativa
- [ ] Zero `style` estático · classes condicionais via `cn()` · zero hex novo fora de `tailwind.config.ts`
- [ ] Nenhuma query com campos inexistentes (`price_per_100g_cents`, `is_deleted` em categories)
- [ ] Nenhum `getSupabaseAdmin()` em arquivo `'use client'`
- [ ] `'use client'` só onde há interatividade real · `next/image` em todas as imagens
- [ ] `npm run build 2>&1` → zero erros · `git diff --staged --stat` → apenas arquivos esperados

---

## Ponteiros

| Recurso | Identificador |
|---|---|
| Supabase project | `ymjmgukuojwumvtaglyp` (São Paulo) |
| Vercel team | `team_n2LeQBoo0SJSpN5VZ1zRwfZc` (andressadanfres-projects) |
| Notion — 🗺️ 00 Mapa do Projeto | `35df86ce-18e5-81f2-9f9a-d342f044931d` |
| Notion — Framework E-commerce 2026 | `33bf86ce-18e5-815f-892f-c82b14a5b870` |
| Notion — Site Institucional & Marketing | `343f86ce-18e5-8102-b577-d0f562c5b10e` |
| GA4 | `G-C6W30XMXN3` · propriedade 491153641 — **nunca criar nova** |
| Meta Pixel | `2291807841017792` — **nunca criar novo** |
| Google Ads | conta 760-664-9903 · conversão AW-763361661 |
| UTM taxonomy | Google: `utm_source=google&utm_medium=cpc&utm_campaign=fundinho\|umc` · Meta: `utm_source=meta&utm_medium=paid_social` — nunca criar padrão novo |
| WhatsApp Fundinho | (34) 99781-9292 · Praça Clarimundo Carneiro, 119 |
| WhatsApp UMC (quiosque, sem retirada) | (34) 99796-9191 · Rua Rafael Marino Neto, 600 |
| Site institucional (provisório) | www.graneldapraca.com.br · repo `Andressadanfre/graneldapraca-landing` |

**Estado atual de implementação: ver topo do log no Notion Mapa do Projeto — nunca este arquivo.**
