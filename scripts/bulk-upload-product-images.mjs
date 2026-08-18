import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
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

const PASTA_LOCAL = 'C:\\Users\\Dell\\Pictures\\imagens-e-commece-granel'
const BUCKET = 'product-images'
const MAX_PX = 800
const WEBP_QUALITY = 80

const MAPEAMENTO = [
  ['acucar-de-coco.jpg', 'acucar-de-coco'],
  ['alecrim.jpg', 'alecrim'],
  ['alfazema-azul.jpg', 'alfazema-azul'],
  ['alho-em-po.jpg', 'alho-em-po'],
  ['amaranto-em-flocos.jpg', 'amaranto-em-flocos'],
  ['amendoa-defumada.jpg', 'amendoa-defumada'],
  ['amendoa-laminada.jpg', 'amendoa-laminada'],
  ['amendoim-doce.jpg', 'amendoim-doce'],
  ['anis-estrelado.jpg', 'anis-estrelado'],
  ['argila-branca.jpg', 'argila-branca'],
  ['argila-preta.jpg', 'argila-preta'],
  ['argila-verde.jpg', 'argila-verde'],
  ['aromatizador-eletrico-via-aroma.jpg', 'aromatizador-eletrico-via-aroma'],
  ['aveia-flocos-finos.jpg', 'aveia-em-flocos-fina'],
  ['aveia-flocos-grossos.jpg', 'aveia-em-flocos-grossa'],
  ['açucar-demerara-organico.jpg', 'acucar-demerara-organico'],
  ['açucar-mascavo.jpg', 'acucar-mascavo'],
  ['banana-chips-salgada.jpg', 'banana-chips-salgada'],
  ['bicarbonato-de-sodio.jpg', 'bicarbonato-de-sodio'],
  ['canela-em-po.jpg', 'canela-em-po'],
  ['castanha-de-caju-caramelizada.jpg', 'castanha-de-caju-caramelizada'],
  ['castanha-do-para-quebrada.jpg', 'castanha-do-para-quebrada'],
  ['catuaba-em-po.jpg', 'catuaba-em-po'],
  ['cebola-em-flocos.jpg', 'cebola-em-flocos'],
  ['cebola-em-po.jpg', 'cebola-em-po'],
  ['cha-de-quebra-pedra.jpg', 'cha-de-quebra-pedra'],
  ['chilli-mexicano.jpg', 'chili-mexicano'],
  ['chimichurri-com-pimenta.jpg', 'chimichurri-com-pimenta'],
  ['chips-de-coco.jpg', 'chips-de-coco'],
  ['coentro-em-grao.jpg', 'coentro-graos'],
  ['cravo-em-grao.jpg', 'cravo-grao'],
  ['cravo-em-po.jpg', 'cravo-po'],
  ['creme-de-cebola.jpg', 'creme-de-cebola'],
  ['curry.jpg', 'curry'],
  ['erva-doce.jpg', 'erva-doce'],
  ['farinha-de-amendoas.jpg', 'farinha-de-amendoa'],
  ['farinha-de-beterraba.jpg', 'farinha-de-beterraba'],
  ['farinha-de-castanha-de-caju.jpg', 'farinha-de-castanha-de-caju'],
  ['farinha-de-grao-de-bico.jpg', 'farinha-de-grao-de-bico'],
  ['farinha-de-linhaca.jpg', 'farinha-de-linhaca-dourada'],
  ['farinha-de-maracuja.jpg', 'farinha-de-maracuja'],
  ['farinha-de-uva.jpg', 'farinha-de-uva'],
  ['fecula-de-batata.jpg', 'fecula-de-batata'],
  ['fibra-de-maca.jpg', 'fibra-de-maca'],
  ['funcho.jpg', 'funcho'],
  ['gengibre-em-po.jpg', 'gengibre-em-po'],
  ['gergelim-integral.jpg', 'gergelim-integral'],
  ['gergelim-misto.jpg', 'gergelim-misto'],
  ['ginseng-em-po.jpg', 'ginseng-em-po'],
  ['ginseng-panax-em-capsulas.jpg', 'ginseng-panax-60-caps'],
  ['goji-gerry.jpg', 'goji-berry'],
  ['granola-com-acucar-mascavo.jpg', 'granola-com-acucar-mascavo-grannutri'],
  ['grao-de-bico.jpg', 'grao-de-bico-12mm'],
  ['guarana-em-po.jpg', 'guarana-em-po'],
  ['jaca-chips.jpg', 'jaca-chips'],
  ['kishow-de-avela.jpg', 'kishow-avela'],
  ['laranja-em-rodelas.jpg', 'laranja-em-rodelas'],
  ['lentilha-canadense.jpg', 'lentilha-canadense'],
  ['limao-em-rodelas-desidratado.jpg', 'limao-desidratado'],
  ['linhaca-dourada.jpg', 'linhaca-dourada'],
  ['linhaca-marrom.jpg', 'linhaca-marrom'],
  ['maca-peruana-black.jpg', 'maca-peruana-black'],
  ['magnesio-inositol.jpg', 'magnesio-inositol-350g'],
  ['mix-de-quinoa.jpg', 'mix-de-quinua'],
  ['mix-de-sementes.jpg', 'mix-de-sementes'],
  ['mix-de-vegetais.jpg', 'mix-de-vegetais-chips'],
  ['noz-moscada-bola.jpg', 'noz-moscada-bola-inteira'],
  ['nozes-mariposa.jpg', 'nozes-mariposa-extra-light'],
  ['oleo-essencial-eucalipto.jpg', 'oleo-essencial-eucalipto-10ml'],
  ['ora-pro-nobis-po.jpg', 'ora-pro-nobis-po'],
  ['oregano.jpg', 'oregano'],
  ['paprica-picante.jpg', 'paprica-picante'],
  ['pasta-de-amendoim-mandubim.jpg', 'pasta-de-amendoim-mandubim'],
  ['pata-de-vaca.jpg', 'pata-de-vaca'],
  ['pimenta-calabresa.jpg', 'pimenta-calabresa'],
  ['pistache-cru-sem-casca.jpg', 'pistache-cru-sem-casca'],
  ['proteina-de-soja-isolada.jpg', 'proteina-de-soja-isolada'],
  ['provolone-desidratado.jpg', 'provolone-desidratado'],
  ['quinoa-branca-em-grao.jpg', 'quinua-branca-em-grao'],
  ['quinoa-em-flocos.jpg', 'quinua-flocos'],
  ['quinoa-vermelha-em-grao.jpg', 'quinua-vermelha-em-graos'],
  ['sal-integral-smart.jpg', 'sal-integral-smart'],
  ['salsa-desidratada.jpg', 'salsa-desidratada'],
  ['semente-de-abobora-crua.jpg', 'semente-de-abobora-sem-casca-crua'],
  ['spirulina-em-po.jpg', 'spirulina'],
  ['stevia-em-po.jpg', 'stevia-em-po'],
  ['sucrilhos-sem-acucar.jpg', 'sucrilhos-natural-sem-acucar'],
  ['tamara-sem-caroco.jpg', 'tamara-sem-caroco'],
  ['tempero-ana-maria.jpg', 'tempero-ana-maria'],
  ['tempero-baiano.jpg', 'tempero-baiano'],
  ['tempero-do-edu.jpg', 'tempero-do-edu'],
  ['tempero-lemon-peper.jpg', 'lemon-pepper'],
  ['tempero-orange-peper.jpg', 'orange-pepper'],
  ['tempero-pega-esposa.jpg', 'tempero-pega-esposa'],
  ['tempero-pega-marido.jpg', 'tempero-pega-marido'],
  ['trigo-em-graos.jpg', 'trigo-em-graos'],
  ['trigo-para-kibe.jpg', 'trigo-para-kibe'],
  ['uva-passa-branca.jpg', 'uva-passa-branca'],
  ['uva-passa-preta.jpg', 'uva-passa-preta'],
  ['zimbro.jpg', 'zimbro'],
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  console.log(`${MAPEAMENTO.length} produtos na fila${DRY_RUN ? ' (DRY RUN - nada sera alterado)' : ''}\n`)
  const sucesso = []
  const falha = []

  for (const [arquivo, slug] of MAPEAMENTO) {
    try {
      const { data: produto, error: findError } = await supabase
        .from('products')
        .select('id, slug')
        .eq('slug', slug)
        .eq('is_deleted', false)
        .maybeSingle()

      if (findError) throw findError
      if (!produto) throw new Error('produto nao encontrado no banco')

      const bufferOriginal = await readFile(join(PASTA_LOCAL, arquivo))
      const bufferProcessado = await sharp(bufferOriginal)
        .resize(MAX_PX, MAX_PX, { fit: 'inside' })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()

      if (DRY_RUN) {
        console.log(`[dry] ${arquivo} -> ${slug} (${(bufferProcessado.length / 1024).toFixed(0)}kb)`)
        sucesso.push(slug)
        continue
      }

      const objectPath = `${slug}-produto.webp`
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

      sucesso.push(slug)
      console.log(`OK  ${slug}`)
    } catch (err) {
      falha.push({ arquivo, slug, erro: err.message })
      console.error(`ERRO ${slug}: ${err.message}`)
    }
  }

  console.log(`\n--- ${sucesso.length} sucesso / ${falha.length} falha ---`)
  if (falha.length) console.log(JSON.stringify(falha, null, 2))
}

main()
