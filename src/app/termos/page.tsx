import type { Metadata } from 'next'
import Link from 'next/link'

import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Termos de Uso | Granel da Praça',
  description: 'Termos de uso e condições de compra da Granel da Praça.',
  alternates: { canonical: '/termos' },
}

// TODO: preencher data real de publicação antes de ir pra produção
const LAST_UPDATED = '17/08/2026'

export default function TermosDeUsoPage() {
  return (
    <LegalPageLayout title="Termos de Uso e Condições de Compra" lastUpdated={LAST_UPDATED}>
      <p>
        Ao utilizar o site www.graneldapraca.com.br ou realizar uma compra, você concorda com
        estes Termos e com nossa{' '}
        <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>1. Identificação da empresa</h2>
      <p>
        <strong>Granel da Praça</strong> é nome fantasia de <strong>ANBA Comércio e Serviços LTDA</strong>.
        <br />
        Unidade Fundinho (matriz): Praça Clarimundo Carneiro, 119, Uberlândia/MG — CNPJ 27.673.614/0001-90
        <br />
        Unidade UMC (filial): Rua Rafael Marino Neto, 600, Uberlândia/MG — CNPJ 27.673.614/0002-71
      </p>

      <h2>2. Cadastro</h2>
      <p>
        Para comprar, você deve criar uma conta com dados verdadeiros, completos e atualizados.
        Você é responsável pela guarda de sua senha e por toda atividade realizada em sua conta.
      </p>

      <h2>3. Produtos a granel</h2>
      <p>
        Nossos produtos são vendidos a granel, com <strong>compra mínima de 100g</strong> e{' '}
        <strong>incrementos de 100g</strong> por item. Pesos exibidos no site são aproximados; o
        peso final cobrado corresponde à quantidade efetivamente separada e pode variar
        minimamente conforme a natureza do produto.
      </p>

      <h2>4. Preços e pagamento</h2>
      <p>
        Pagamentos são processados via <strong>Mercado Pago</strong>, aceitando Pix e cartão de
        crédito/débito. Parcelamento disponível em 2x para pedidos a partir de R$150 e 3x a partir
        de R$300, sem juros. Não armazenamos dados do seu cartão — o processamento é feito
        integralmente pelo Mercado Pago.
      </p>

      <h2>5. Entrega e retirada</h2>
      <ul>
        <li><strong>Frete grátis</strong> para pedidos acima de R$100; frete fixo de <strong>R$15</strong> abaixo desse valor.</li>
        <li>Pedidos devem ser feitos até <strong>17h</strong> (dias úteis) ou até <strong>11h</strong> (sábados) para entrega no mesmo dia.</li>
        <li><strong>Não realizamos entregas aos domingos.</strong></li>
        <li>
          <strong>Retirada e entrega dos pedidos do site são realizadas exclusivamente pela
          Unidade Fundinho (matriz).</strong> A Unidade UMC é ponto de venda presencial e não
          participa da logística de pedidos feitos pelo site.
        </li>
      </ul>

      <h2>6. Direito de arrependimento</h2>
      <p>
        Nos termos do Art. 49 do Código de Defesa do Consumidor, você tem até{' '}
        <strong>7 dias corridos</strong>, a contar do recebimento, para desistir da compra e
        solicitar reembolso integral, sem necessidade de justificativa — ressalvadas as
        limitações naturais de produtos alimentícios a granel já abertos ou consumidos, que serão
        avaliadas caso a caso por questões sanitárias.
      </p>

      <h2>7. Trocas e devoluções</h2>
      <p>
        Produtos com problema de qualidade existente no momento da entrega (contaminação,
        deterioração prematura, divergência do pedido) podem ser trocados ou reembolsados mediante
        contato com nossa equipe pelo WhatsApp da unidade correspondente, em até{' '}
        <strong>30 dias corridos</strong> do recebimento, nos termos do Art. 26 do Código de Defesa
        do Consumidor.
      </p>
      <p>
        Esse prazo não se aplica a produtos que atingiram naturalmente o fim do seu prazo de
        validade impresso na embalagem — nesse caso, não se trata de vício do produto, e sim do
        decurso normal da validade, que varia conforme a natureza de cada item.
      </p>

      <h2>8. Atendimento</h2>
      <p>
        Nosso atendimento é realizado via WhatsApp pelas unidades Fundinho e UMC. Parte do
        atendimento inicial pode ser realizada por assistente automatizado; você pode solicitar
        atendimento humano a qualquer momento.
      </p>

      <h2>9. Propriedade intelectual</h2>
      <p>
        Todo o conteúdo do site (marca, textos, imagens, layout) pertence à Granel da Praça e não
        pode ser reproduzido sem autorização prévia.
      </p>

      <h2>10. Limitação de responsabilidade</h2>
      <p>
        Não nos responsabilizamos por atrasos causados por terceiros (transportadoras,
        instabilidades do Mercado Pago) ou por informações de entrega incorretas fornecidas pelo
        cliente.
      </p>

      <h2>11. Alterações destes termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. A versão vigente é sempre a publicada
        no site na data da sua compra.
      </p>

      <h2>12. Legislação aplicável e foro</h2>
      <p>
        Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de
        Uberlândia/MG para dirimir eventuais controvérsias, ressalvado o direito do consumidor de
        optar pelo foro de seu domicílio.
      </p>
    </LegalPageLayout>
  )
}
