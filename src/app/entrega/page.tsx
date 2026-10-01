import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Entrega e Retirada | Granel da Praça',
  description: 'Prazos, frete e política de entrega e retirada da Granel da Praça em Uberlândia.',
  alternates: { canonical: '/entrega' },
}

export default function EntregaPage() {
  return (
    <LegalPageLayout title="Entrega e Retirada" lastUpdated="17/08/2026">
      <h2>Onde retiramos e entregamos</h2>
      <p>
        <strong>Retirada e entrega dos pedidos do site são realizadas exclusivamente pela
        Unidade Fundinho (matriz)</strong> — Praça Clarimundo Carneiro, 119, Loja 06, Fundinho, Uberlândia/MG.
        A Unidade UMC é ponto de venda presencial e não participa da logística de pedidos
        feitos pelo site.
      </p>
      <p>
        Horário de retirada na loja: segunda a sexta, 9h às 18h; sábado, 9h às 12h. O pedido
        fica pronto em até 1h após a confirmação, dentro do horário da loja.
      </p>

      <h2>Frete</h2>
      <ul>
        <li><strong>Frete grátis</strong> para pedidos acima de R$100.</li>
        <li>Frete fixo de <strong>R$15</strong> para pedidos abaixo desse valor.</li>
        <li>Entrega restrita à zona urbana de Uberlândia.</li>
      </ul>

      <h2>Prazos</h2>
      <ul>
        <li>Pedidos feitos até <strong>17h</strong> (dias úteis) ou até <strong>11h30</strong> (sábados) saem para entrega no mesmo dia.</li>
        <li>Aos sábados, os pedidos saem para entrega até 12h e podem chegar no início da tarde.</li>
        <li><strong>Não realizamos entregas aos domingos.</strong></li>
      </ul>
    </LegalPageLayout>
  )
}
