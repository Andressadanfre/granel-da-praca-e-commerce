import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Receitas com Produtos Naturais | Granel da Praça',
  description:
    'Receitas práticas e saborosas feitas com produtos naturais a granel. Cocada cremosa, brownie funcional, crackers de sementes e farofa de castanhas.',
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Ingrediente {
  item: string
  categorySlug?: string // slug da categoria para linkar ao catálogo
}

interface Receita {
  slug: string
  titulo: string
  descricao: string
  tempoPreparo: string
  tempoForno?: string
  rendimento: string
  tag: string
  imgSrc: string
  imgAlt: string
  ingredientes: Ingrediente[]
  adocanteLowCarb?: string
  adocanteTradicional?: string
  passos: string[]
  dica?: string
}

// ─── Dados ───────────────────────────────────────────────────────────────────

const receitas: Receita[] = [
  {
    slug: 'cocada-cremosa-com-amendoas',
    titulo: 'Cocada Cremosa de Forno com Amêndoas',
    descricao:
      'Uma versão nutritiva e reconfortante da cocada tradicional, com crocância extra de amêndoas e textura aveludada.',
    tempoPreparo: '10 min',
    tempoForno: '20 min',
    rendimento: '6 porções',
    tag: 'Doce',
    imgSrc: '/receitas/cocada-cremosa-com-amendoas.webp',
    imgAlt: 'Cocada cremosa de forno com amêndoas douradas por cima',
    ingredientes: [
      { item: '2 xícaras de coco ralado fino sem açúcar', categorySlug: 'suplementos-naturais' },
      { item: '½ xícara de amêndoas laminadas', categorySlug: 'castanhas' },
      { item: '2 colheres de sopa de farinha de aveia', categorySlug: 'farinhas' },
      { item: '2 ovos inteiros' },
      { item: '½ xícara de leite de coco' },
      { item: '1 colher de sopa de óleo de coco', categorySlug: 'oleos-e-adocantes-naturais' },
      { item: '1 colher de chá de essência de baunilha' },
    ],
    adocanteLowCarb: '½ xícara de xilitol ou ½ colher de chá de néctar de stévia concentrado',
    adocanteTradicional: '½ xícara de açúcar demerara ou açúcar mascavo',
    passos: [
      'Em uma tigela, bata levemente os ovos com o leite de coco, o óleo de coco, a baunilha e a opção escolhida para adoçar.',
      'Adicione o coco ralado, a farinha de aveia e metade das amêndoas laminadas. Misture bem até formar uma massa homogênea e úmida.',
      'Transfira para um refratário pequeno untado com óleo de coco.',
      'Salpique o restante das amêndoas laminadas por cima.',
      'Leve ao forno pré-aquecido a 180 °C por cerca de 20 minutos ou até dourar. Sirva morno ou gelado.',
    ],
  },
  {
    slug: 'brownie-funcional-de-cacau-com-nozes',
    titulo: 'Brownie Funcional de Cacau com Nozes',
    descricao:
      'Denso, molhado por dentro e rico em gorduras boas, antioxidantes e fibras. Sem glúten, sem açúcar refinado.',
    tempoPreparo: '15 min',
    tempoForno: '25 min',
    rendimento: '8 quadrados',
    tag: 'Doce',
    imgSrc: '/receitas/brownie-funcional-de-cacau-com-nozes.webp',
    imgAlt: 'Brownie funcional de cacau com nozes em prato rústico',
    ingredientes: [
      { item: '1 xícara de cacau em pó 100%', categorySlug: 'chocolates-de-verdade' },
      { item: '½ xícara de farinha de amêndoa', categorySlug: 'farinhas' },
      { item: '½ xícara de nozes picadas', categorySlug: 'castanhas' },
      { item: '2 colheres de sopa de semente de linhaça dourada moída', categorySlug: 'graos-e-sementes' },
      { item: '⅓ xícara de óleo de coco derretido', categorySlug: 'oleos-e-adocantes-naturais' },
      { item: '1 pitada de sal marinho' },
      { item: '1 colher de chá de fermento em pó' },
    ],
    adocanteLowCarb: '¾ xícara de xilitol',
    adocanteTradicional: '¾ xícara de açúcar mascavo ou demerara',
    passos: [
      'Hidrate a linhaça: misture 2 colheres de sopa de linhaça com 6 colheres de sopa de água morna e deixe descansar por 5 minutos.',
      'Misture a linhaça hidratada com o óleo de coco e o adoçante escolhido até obter uma mistura lisa.',
      'Adicione o cacau 100%, a farinha de amêndoa e o sal. Misture bem.',
      'Incorpore o fermento e as nozes picadas delicadamente.',
      'Despeje em forma pequena forrada com papel manteiga. Asse a 180 °C por 20 a 25 minutos — o centro deve continuar levemente úmido.',
      'Deixe esfriar completamente antes de cortar.',
    ],
    dica: 'Quanto mais úmido no centro, mais cremoso fica depois de gelado. Guarde na geladeira por até 5 dias.',
  },
  {
    slug: 'crackers-crocantes-de-multissementes',
    titulo: 'Crackers Crocantes de Multissementes',
    descricao:
      'Perfeitos para petiscar com patês ou queijos. Sem glúten, sem farinha de trigo. Duram semanas em pote bem vedado.',
    tempoPreparo: '10 min',
    tempoForno: '30 min',
    rendimento: 'Aprox. 20 unidades',
    tag: 'Salgado · Sem glúten',
    imgSrc: '/receitas/crackers-crocantes-de-multissementes.webp',
    imgAlt: 'Crackers crocantes de multissementes sobre tábua de madeira',
    ingredientes: [
      { item: '½ xícara de semente de girassol', categorySlug: 'graos-e-sementes' },
      { item: '½ xícara de semente de abóbora sem casca', categorySlug: 'graos-e-sementes' },
      { item: '½ xícara de gergelim branco ou preto', categorySlug: 'graos-e-sementes' },
      { item: '¼ xícara de semente de chia', categorySlug: 'graos-e-sementes' },
      { item: '¼ xícara de semente de linhaça dourada', categorySlug: 'graos-e-sementes' },
      { item: '1 xícara de água morna' },
      { item: '1 colher de chá de sal marinho' },
      { item: '1 colher de chá de ervas finas (orégano, alecrim, manjericão)', categorySlug: 'temperos-e-especiarias' },
      { item: '1 colher de sopa de azeite de oliva' },
    ],
    passos: [
      'Junte todas as sementes, o sal, as ervas, o azeite e a água morna em uma tigela. Misture bem.',
      'Deixe descansar por 10 a 15 minutos até a chia e a linhaça soltarem mucilagem e formarem uma massa firme.',
      'Espalhe a massa bem fina sobre assadeira com papel manteiga, pressionando com as costas de uma colher.',
      'Asse a 170 °C por 20 minutos. Retire, marque os cortes com uma faca e volte ao forno por mais 10 a 15 minutos até ficarem secos e crocantes.',
      'Espere esfriar completamente antes de guardar em pote hermético.',
    ],
    dica: 'Quanto mais fina a camada, mais crocante fica. Menos de 3 mm é o ideal.',
  },
  {
    slug: 'farofa-funcional-castanha-do-para',
    titulo: 'Farofa Funcional de Castanha-do-Pará e Açafrão',
    descricao:
      'O acompanhamento perfeito para o dia a dia: rica em selênio, fibras e compostos anti-inflamatórios.',
    tempoPreparo: '15 min',
    rendimento: '6 a 8 porções',
    tag: 'Salgado · Sem glúten',
    imgSrc: '/receitas/farofa-funcional-castanha-do-para.webp',
    imgAlt: 'Farofa funcional de castanha-do-pará e açafrão em tigela rústica',
    ingredientes: [
      { item: '1 xícara de castanha-do-pará picada', categorySlug: 'castanhas' },
      { item: '½ xícara de semente de girassol', categorySlug: 'graos-e-sementes' },
      { item: '½ xícara de gergelim branco', categorySlug: 'graos-e-sementes' },
      { item: '1½ xícara de farinha de mandioca biju ou aveia em flocos grossos', categorySlug: 'farinhas' },
      { item: '1 colher de chá de açafrão-da-terra (cúrcuma) em pó', categorySlug: 'temperos-e-especiarias' },
      { item: '1 colher de chá de cebola em flocos', categorySlug: 'temperos-e-especiarias' },
      { item: '1 colher de chá de alho em flocos', categorySlug: 'temperos-e-especiarias' },
      { item: '1 colher de chá de sal rosa ou sal marinho' },
      { item: '3 colheres de sopa de azeite de oliva ou manteiga ghee', categorySlug: 'oleos-e-adocantes-naturais' },
    ],
    passos: [
      'Em frigideira ampla, aqueça o azeite (ou ghee) e doure o alho e a cebola em flocos.',
      'Adicione a castanha-do-pará picada, a semente de girassol e o gergelim. Salteie em fogo médio por 3 minutos.',
      'Adicione o açafrão-da-terra e o sal, misturando bem.',
      'Adicione a farinha de mandioca biju (ou aveia em flocos grossos).',
      'Cozinhe em fogo baixo, mexendo sempre, por 5 a 7 minutos até ficar bem dourada e crocante.',
      'Deixe esfriar antes de armazenar em pote hermético.',
    ],
    dica: 'Substitua a farinha de mandioca por aveia em flocos grossos para uma versão com mais fibras e menor índice glicêmico.',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: string }) {
  const isSweet = tag.startsWith('Doce')
  return (
    <span
      className={[
        'inline-block rounded-full px-3 py-1 text-[10px] font-700 uppercase tracking-[.08em]',
        isSweet
          ? 'bg-[#FBF1EE] text-[#C0694A]'
          : 'bg-[#EEF2FF] text-[#3730A3]',
      ].join(' ')}
    >
      {tag}
    </span>
  )
}

function IngredienteItem({ ingrediente }: { ingrediente: Ingrediente }) {
  if (ingrediente.categorySlug) {
    return (
      <li className="flex items-start gap-2 text-[13.5px] text-t6">
        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-gd" />
        <Link
          href={`/loja?categoria=${ingrediente.categorySlug}`}
          className="text-gd underline-offset-2 hover:underline"
        >
          {ingrediente.item}
        </Link>
      </li>
    )
  }
  return (
    <li className="flex items-start gap-2 text-[13.5px] text-t6">
      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-t4" />
      {ingrediente.item}
    </li>
  )
}

function AdocanteBox({
  lowCarb,
  tradicional,
}: {
  lowCarb: string
  tradicional: string
}) {
  return (
    <div className="rounded-inner border border-bd bg-surface p-4">
      <p className="mb-2 text-[10px] font-700 uppercase tracking-[.08em] text-t4">
        Opção para adoçar — escolha uma
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-gd bg-[#DCFCE7] text-center text-[9px] leading-4 text-gd font-700">LC</span>
          <span className="text-[12.5px] text-t6">
            <strong className="font-600 text-t9">Low carb:</strong> {lowCarb}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-[#C0694A] bg-[#FBF1EE] text-center text-[9px] leading-4 text-[#C0694A] font-700">T</span>
          <span className="text-[12.5px] text-t6">
            <strong className="font-600 text-t9">Tradicional:</strong> {tradicional}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Card de receita ─────────────────────────────────────────────────────────

function ReceitaCard({ receita, index }: { receita: Receita; index: number }) {
  const isReversed = index % 2 !== 0

  return (
    <article
      id={receita.slug}
      className="scroll-mt-28 rounded-card border border-bd bg-white shadow-card overflow-hidden"
    >
      {/* Imagem */}
      <div className="relative h-[220px] w-full bg-cream-img sm:h-[260px]">
        <Image
          src={receita.imgSrc}
          alt={receita.imgAlt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
          priority={index < 2}
        />
        <div className="absolute left-4 top-4">
          <TagBadge tag={receita.tag} />
        </div>
      </div>

      {/* Corpo */}
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-[22px] font-700 leading-tight text-t9 sm:text-[26px]">
            {receita.titulo}
          </h2>
          <p className="mt-2 text-[14px] text-t6 leading-relaxed">
            {receita.descricao}
          </p>
          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-[12px] text-t6">
              <span className="text-gd">⏱</span>
              <span>Preparo: <strong className="font-600 text-t9">{receita.tempoPreparo}</strong></span>
            </div>
            {receita.tempoForno && (
              <div className="flex items-center gap-1.5 text-[12px] text-t6">
                <span className="text-gd">🔥</span>
                <span>Forno: <strong className="font-600 text-t9">{receita.tempoForno}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[12px] text-t6">
              <span className="text-gd">🍽</span>
              <span>Rende: <strong className="font-600 text-t9">{receita.rendimento}</strong></span>
            </div>
          </div>
        </div>

        {/* Grid ingredientes + modo de preparo */}
        <div className={`grid gap-8 ${isReversed ? 'lg:grid-cols-[3fr_4fr]' : 'lg:grid-cols-[4fr_3fr]'}`}>
          {/* Ingredientes */}
          <div className={isReversed ? 'lg:order-2' : ''}>
            <h3 className="mb-3 text-[11px] font-700 uppercase tracking-[.1em] text-t4">
              Ingredientes a granel
            </h3>
            <ul className="flex flex-col gap-2">
              {receita.ingredientes.map((ing, i) => (
                <IngredienteItem key={i} ingrediente={ing} />
              ))}
            </ul>
            {(receita.adocanteLowCarb && receita.adocanteTradicional) && (
              <div className="mt-4">
                <AdocanteBox
                  lowCarb={receita.adocanteLowCarb}
                  tradicional={receita.adocanteTradicional}
                />
              </div>
            )}
          </div>

          {/* Modo de preparo */}
          <div className={isReversed ? 'lg:order-1' : ''}>
            <h3 className="mb-3 text-[11px] font-700 uppercase tracking-[.1em] text-t4">
              Modo de preparo
            </h3>
            <ol className="flex flex-col gap-4">
              {receita.passos.map((passo, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gdeep text-[11px] font-700 text-white">
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] text-t6 leading-relaxed">{passo}</span>
                </li>
              ))}
            </ol>
            {receita.dica && (
              <div className="mt-5 flex items-start gap-2 rounded-inner bg-[#F0FDF4] border border-[#C6E6C7] p-3">
                <span className="text-base leading-none">💡</span>
                <p className="text-[12px] text-gd leading-relaxed">
                  <strong className="font-600">Dica:</strong> {receita.dica}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA comprar ingredientes */}
        <div className="mt-6 flex items-center justify-between border-t border-bd pt-5">
          <p className="text-[12px] text-t4">
            Ingredientes sublinhados linkam direto para a categoria na loja.
          </p>
          <Link
            href="/loja"
            className="rounded-sel bg-gd px-5 py-2.5 text-[13px] font-600 text-white transition-colors hover:bg-ghover"
          >
            Ver catálogo →
          </Link>
        </div>
      </div>
    </article>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function ReceitasPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gdeep py-14 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-5 xl:px-0">
          <p className="mb-3 text-[11px] font-700 uppercase tracking-[.1em] text-g">
            Granel da Praça · Receitas
          </p>
          <h1 className="max-w-[520px] text-[32px] font-700 leading-tight text-white sm:text-[40px]">
            Receitas com produtos naturais a granel
          </h1>
          <p className="mt-4 max-w-[480px] text-[15px] text-white/65 leading-relaxed">
            Quatro receitas práticas usando ingredientes campeões de vendas. Clique nos ingredientes sublinhados para comprar direto no catálogo.
          </p>
          {/* Índice rápido */}
          <div className="mt-8 flex flex-wrap gap-3">
            {receitas.map((r) => (
              <a
                key={r.slug}
                href={`#${r.slug}`}
                className="rounded-full border border-white/20 bg-white/08 px-4 py-2 text-[12px] font-500 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                {r.titulo.split(' ').slice(0, 3).join(' ')}…
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Receitas */}
      <section className="mx-auto max-w-[860px] px-5 py-12 xl:px-0">
        <div className="flex flex-col gap-10">
          {receitas.map((receita, i) => (
            <ReceitaCard key={receita.slug} receita={receita} index={i} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 rounded-card bg-gdeep p-8 text-center">
          <p className="text-[13px] text-white/60">Todos os ingredientes disponíveis a granel</p>
          <h2 className="mt-2 text-[22px] font-700 text-white">
            Compre apenas o quanto você precisa
          </h2>
          <Link
            href="/loja"
            className="mt-5 inline-block rounded-sel bg-g px-8 py-3 text-[14px] font-700 text-white transition-colors hover:bg-ghover"
          >
            Ir para a loja →
          </Link>
        </div>
      </section>
    </main>
  )
}
