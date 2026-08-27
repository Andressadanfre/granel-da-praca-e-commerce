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
        Unidade Fundinho (matriz)</strong> — Praça Clarimundo Carneiro, 119, Uberlândia/MG.
        A Unidade UMC é ponto de venda presencial e não participa da logística de pedidos
        feitos pelo site.
      </p>
      <p>Horário de retirada na loja: Segunda a Sábado, 8h às 18h.</p>

      <h2>Frete</h2>
      <ul>
        <li><strong>Frete grátis</strong> para pedidos acima de R$100.</li>
        <li>Frete fixo de <strong>R$15</strong> para pedidos abaixo desse valor.</li>
        <li>Entrega restrita à zona urbana de Uberlândia.</li>
      </ul>

      <h2>Prazos</h2>
      <ul>
        <li>Pedidos feitos até <strong>17h</strong> (dias úteis) ou até <strong>11h</strong> (sábados) saem para entrega no mesmo dia.</li>
        <li><strong>Não realizamos entregas aos domingos.</strong></li>
      </ul>
    </LegalPageLayout>
  )
}
