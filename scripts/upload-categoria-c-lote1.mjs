import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import { existsSync, readFileSync, statSync } from 'fs'
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
        const value = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        return [line.slice(0, eqIdx).trim(), value]
      })
  )
} catch {
  console.error('❌ Não foi possível ler .env.local')
  process.exit(1)
}

const SUPABASE_URL          = envVars.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY      = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis obrigatórias não encontradas no .env.local:')
  if (!SUPABASE_URL)     console.error('   • NEXT_PUBLIC_SUPABASE_URL')
  if (!SERVICE_ROLE_KEY) console.error('   • SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const pastaArg = process.argv.find(a => a.startsWith('--pasta='))
const PASTA_LOCAL = pastaArg
  ? pastaArg.slice('--pasta='.length)
  : 'C:\\Users\\Dell\\Pictures\\imagens-e-commece-granel'
const BUCKET = 'product-images'
const MAX_PX = 800
const WEBP_QUALITY = 80
const DRY_RUN = process.argv.includes('--dry-run')

function resolverCaminhoCsv() {
  const arg = process.argv.slice(2).find(a => !a.startsWith('--'))
  const nome = arg || 'mapeamento-categoria-c-lote1.csv'
  const candidatos = [
    nome,
    join(__dirname, nome),
    join(__dirname, 'mapeamento-categoria-c-lote1.csv', nome),
  ]

  for (const candidato of candidatos) {
    if (!existsSync(candidato)) continue
    if (statSync(candidato).isDirectory()) {
      const aninhado = join(candidato, nome)
      if (existsSync(aninhado) && !statSync(aninhado).isDirectory()) {
        return aninhado
      }
      continue
    }
    return candidato
  }

  throw new Error(`CSV não encontrado: ${nome}`)
}

function lerMapeamento(csvPath) {
  const conteudo = readFileSync(csvPath, 'utf8')
  const linhas = conteudo.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  if (linhas.length === 0) {
    throw new Error('CSV vazio')
  }

  const cabecalho = linhas[0].split(',').map(c => c.trim())
  const idxArquivo = cabecalho.indexOf('arquivo_local')
  const idxId = cabecalho.indexOf('product_id')

  if (idxArquivo === -1 || idxId === -1) {
    throw new Error('CSV precisa das colunas arquivo_local e product_id')
  }

  return linhas.slice(1).map((linha, i) => {
    const colunas = linha.split(',').map(c => c.trim())
    const arquivo_local = colunas[idxArquivo]
    const product_id_raw = colunas[idxId]
    const product_id = Number(product_id_raw)

    if (!arquivo_local || !Number.isInteger(product_id) || product_id <= 0) {
      throw new Error(`Linha ${i + 2} inválida: "${linha}"`)
    }

    return { arquivo_local, product_id, linha: i + 2 }
  })
}

async function main() {
  const csvPath = resolverCaminhoCsv()
  const mapeamento = lerMapeamento(csvPath)

  console.log(`CSV: ${csvPath}`)
  console.log(`Pasta local: ${PASTA_LOCAL}`)
  console.log(`Storage: bucket=${BUCKET} upsert=true (overwrite se o arquivo ja existir)`)
  console.log(`${mapeamento.length} produtos na fila${DRY_RUN ? ' (DRY RUN - nada sera alterado)' : ''}\n`)

  const sucesso = []
  const falha = []

  for (const { arquivo_local, product_id, linha } of mapeamento) {
    const rotulo = `${arquivo_local} (id ${product_id})`

    try {
      const { data: produto, error: findError } = await supabase
        .from('products')
        .select('id, slug')
        .eq('id', product_id)
        .eq('is_deleted', false)
        .maybeSingle()

      if (findError) throw findError
      if (!produto) throw new Error('produto nao encontrado no banco')
      if (!produto.slug) throw new Error('produto sem slug no banco')

      const caminhoArquivo = join(PASTA_LOCAL, arquivo_local)
      const bufferOriginal = await readFile(caminhoArquivo)
      const bufferProcessado = await sharp(bufferOriginal)
        .resize(MAX_PX, MAX_PX, { fit: 'inside' })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()

      if (DRY_RUN) {
        console.log(`[dry] linha ${linha}  ${rotulo} -> ${produto.slug} (${(bufferProcessado.length / 1024).toFixed(0)}kb)`)
        sucesso.push({ arquivo_local, product_id, slug: produto.slug })
        continue
      }

      const objectPath = `${produto.slug}-produto.webp`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, bufferProcessado, { contentType: 'image/webp', upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', produto.id)

      if (updateError) throw updateError

      sucesso.push({ arquivo_local, product_id, slug: produto.slug })
      console.log(`OK  linha ${linha}  ${rotulo} -> ${produto.slug}`)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : String(err)
      falha.push({ linha, arquivo_local, product_id, erro: mensagem })
      console.error(`ERRO linha ${linha}  ${rotulo}: ${mensagem}`)
    }
  }

  console.log(`\n--- ${sucesso.length} sucesso / ${falha.length} falha ---`)
  if (falha.length) {
    console.log('\nMotivos das falhas:')
    console.log(JSON.stringify(falha, null, 2))
  }
}

main().catch((err) => {
  console.error('❌ Falha fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
