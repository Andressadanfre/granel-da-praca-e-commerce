/**
 * scripts/generate-descriptions.mjs
 *
 * Gera descrições para produtos sem descrição usando a API do Claude (Haiku).
 * Atualiza a coluna `description` na tabela `products` do Supabase.
 *
 * Uso:
 *   node scripts/generate-descriptions.mjs --dry-run   → 3 exemplos, sem gravar
 *   node scripts/generate-descriptions.mjs             → processa todos os produtos
 *   node scripts/generate-descriptions.mjs --limit 10  → processa até N produtos
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ─── Leitura do .env.local ────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

let envVars = {}
try {
  const envContent = readFileSync(envPath, 'utf8')
  envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#') && line.trim())
      .map(line => {
        const eqIdx = line.indexOf('=')
        return [line.slice(0, eqIdx).trim(), line.slice(eqIdx + 1).trim()]
      })
  )
} catch {
  console.error('❌ Não foi possível ler .env.local')
  process.exit(1)
}

const SUPABASE_URL            = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE   = envVars.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY       = envVars.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !ANTHROPIC_API_KEY) {
  console.error('❌ Variáveis obrigatórias não encontradas no .env.local:')
  if (!SUPABASE_URL)          console.error('   • NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_SERVICE_ROLE) console.error('   • SUPABASE_SERVICE_ROLE_KEY')
  if (!ANTHROPIC_API_KEY)     console.error('   • ANTHROPIC_API_KEY')
  process.exit(1)
}

// ─── Flags de linha de comando ────────────────────────────────────────────────

const args = process.argv.slice(2)
const isDryRun   = args.includes('--dry-run')
const limitFlag  = args.indexOf('--limit')
const limitValue = limitFlag !== -1 ? parseInt(args[limitFlag + 1], 10) : null

const DRY_RUN_SAMPLE    = 3
const DELAY_BETWEEN_MS  = 800   // 800 ms entre chamadas → ~75 req/min (abaixo do limite Haiku)

// ─── Clientes ─────────────────────────────────────────────────────────────────

const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

// ─── Geração de descrição ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um redator especializado em e-commerce de alimentos naturais e produtos a granel.
Seu tom é acolhedor, informativo e apetitoso — adequado para uma loja chamada "Granel da Praça".
Escreva sempre em português brasileiro correto.`

async function generateDescription(productName, categoryName, productType) {
  const tipoVenda = productType === 'granel' ? 'vendido a granel (por peso)' : 'vendido por unidade'

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 180,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Escreva uma descrição curta e atraente para o produto abaixo.

Regras:
- Entre 1 e 3 frases
- Destaque benefícios nutricionais ou culinários relevantes
- NÃO mencione preço, marca ou embalagem
- NÃO use emojis
- Termine com ponto final
- Responda APENAS com o texto da descrição, sem aspas, sem prefixo

Produto: ${productName}
Categoria: ${categoryName}
Forma de venda: ${tipoVenda}`,
      },
    ],
  })

  return response.content[0].text.trim()
}

// ─── Sleep helper ─────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const modeLabel = isDryRun
    ? '🔍 DRY-RUN (sem alterações no banco)'
    : limitValue
    ? `🚀 PRODUÇÃO — limitado a ${limitValue} produto(s)`
    : '🚀 PRODUÇÃO — todos os produtos'

  console.log(`\n🌾  Granel da Praça — Gerador de Descrições`)
  console.log(`    Modo: ${modeLabel}`)
  console.log(`${'─'.repeat(55)}\n`)

  // Busca produtos sem descrição
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      product_type,
      category_id,
      categories ( name )
    `)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .or('description.is.null,description.eq.')
    .order('name')

  if (error) {
    console.error('❌ Erro ao buscar produtos:', error.message)
    process.exit(1)
  }

  const totalSemDescricao = products.length
  console.log(`📦 Produtos sem descrição encontrados: ${totalSemDescricao}\n`)

  if (totalSemDescricao === 0) {
    console.log('✅ Todos os produtos já têm descrição. Nada a fazer.')
    return
  }

  // Limita conforme o modo
  const limit = isDryRun ? DRY_RUN_SAMPLE : (limitValue ?? totalSemDescricao)
  const toProcess = products.slice(0, limit)

  if (isDryRun) {
    console.log(`🔍 Exibindo ${toProcess.length} exemplo(s) — nenhuma alteração será feita:\n`)
  }

  let success = 0
  let failed  = 0

  for (let i = 0; i < toProcess.length; i++) {
    const product      = toProcess[i]
    const categoryName = product.categories?.name ?? 'Geral'
    const counter      = `[${String(i + 1).padStart(3)}/${String(toProcess.length).padStart(3)}]`

    process.stdout.write(`${counter} ${product.name} … `)

    try {
      const description = await generateDescription(
        product.name,
        categoryName,
        product.product_type
      )

      if (isDryRun) {
        console.log('✅')
        console.log()
        console.log(`   📌 Produto:   ${product.name}`)
        console.log(`   📂 Categoria: ${categoryName}`)
        console.log(`   📝 Descrição: ${description}`)
        console.log()
      } else {
        const { error: updateError } = await supabase
          .from('products')
          .update({ description })
          .eq('id', product.id)

        if (updateError) {
          console.log(`❌  (salvar: ${updateError.message})`)
          failed++
        } else {
          console.log('✅')
          success++
        }
      }
    } catch (err) {
      console.log(`❌  (API: ${err.message})`)
      failed++
    }

    // Respeita rate limit — pausa entre chamadas (exceto na última)
    if (i < toProcess.length - 1) {
      await sleep(DELAY_BETWEEN_MS)
    }
  }

  // ─── Resumo ────────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(55)}`)

  if (isDryRun) {
    console.log(`✅ Dry-run OK — ${toProcess.length} descrição(ões) gerada(s) para revisão.`)
    console.log(`\n   Se os resultados estiverem bons, rode sem --dry-run`)
    console.log(`   para processar todos os ${totalSemDescricao} produtos restantes.\n`)
  } else {
    const total = success + failed
    console.log(`✅ Concluído: ${success}/${total} atualizados · ${failed} erro(s)`)
    if (failed > 0) {
      console.log(`   ⚠️  Rode novamente para reprocessar os que falharam.\n`)
    } else {
      console.log()
    }
  }
}

main().catch((err) => {
  console.error('\n❌ Erro inesperado:', err)
  process.exit(1)
})
