import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Granel da Praça',
  description: 'Como a Granel da Praça coleta, usa e protege seus dados pessoais.',
  alternates: { canonical: '/privacidade' },
}

// TODO: preencher data real de publicação antes de ir pra produção
const LAST_UPDATED = '17/08/2026'

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPageLayout title="Política de Privacidade" lastUpdated={LAST_UPDATED}>
      <h2>1. Quem somos</h2>
      <p>
        Esta Política de Privacidade se aplica ao site www.graneldapraca.com.br e aos canais de
        atendimento da <strong>Granel da Praça</strong>, nome fantasia de{' '}
        <strong>ANBA Comércio e Serviços LTDA</strong>, CNPJ 27.673.614/0001-90 (matriz), com
        unidades em:
      </p>
      <ul>
        <li>
          <strong>Unidade Fundinho (matriz)</strong> — Praça Clarimundo Carneiro, 119,
          Uberlândia/MG — WhatsApp (34) 99781-9292 — retirada e entrega de pedidos do site
        </li>
        <li>
          <strong>Unidade UMC</strong> — Rua Rafael Marino Neto, 600, Uberlândia/MG — WhatsApp
          (34) 97969-9191 — atendimento presencial; não participa da logística de pedidos do site
        </li>
      </ul>
      <p>
        Somos os <strong>Controladores</strong> dos seus dados pessoais, nos termos da Lei nº
        13.709/2018 (LGPD).
      </p>

      <h2>2. Quais dados coletamos</h2>
      <p>
        Identificação e contato (nome, CPF, data de nascimento, e-mail, telefone) no cadastro e
        checkout; endereço de entrega no checkout; status de transação de pagamento (não
        armazenamos dados de cartão — processados diretamente pelo Mercado Pago); histórico de
        compras; conversas de atendimento via WhatsApp; e dados de navegação (cookies,
        identificador de dispositivo) ao visitar o site.
      </p>
      <p>Não coletamos dados sensíveis (origem racial, saúde, biometria, etc.) para fins de venda ou marketing.</p>

      <h2>3. Para que usamos seus dados e base legal</h2>
      <ul>
        <li>Processar seu pedido, entrega e nota fiscal — execução de contrato / obrigação legal (fiscal)</li>
        <li>Atendimento via WhatsApp — execução de contrato / legítimo interesse</li>
        <li>Enviar comunicações promocionais (WhatsApp/e-mail/SMS) — consentimento, revogável a qualquer momento</li>
        <li>Prevenir fraude e proteger a operação — legítimo interesse</li>
      </ul>

      <h2>4. Com quem compartilhamos seus dados</h2>
      <p>Compartilhamos dados pessoais apenas com operadores estritamente necessários à operação:</p>
      <ul>
        <li><strong>Mercado Pago</strong> — processamento de pagamentos (Pix, crédito, débito)</li>
        <li><strong>Supabase</strong> — infraestrutura de banco de dados, servidores no Brasil (região São Paulo)</li>
        <li><strong>Transportadora terceirizada</strong> — apenas dados de entrega necessários</li>
      </ul>
      <p>Não vendemos seus dados pessoais a terceiros.</p>

      <h2>5. Por quanto tempo guardamos seus dados</h2>
      <p>
        Mantemos seus dados pelo tempo necessário para cumprir a finalidade da coleta e
        obrigações legais — por exemplo, documentos fiscais são retidos pelo prazo exigido pela
        legislação tributária (5 anos), mesmo após a exclusão da sua conta. Após esse prazo, dados
        pessoais associados são anonimizados.
      </p>

      <h2>6. Seus direitos como titular</h2>
      <p>Você pode, a qualquer momento, solicitar confirmação do tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, eliminação de dados tratados com base em consentimento, revogação do consentimento e informação sobre com quem compartilhamos seus dados.</p>
      <p>Para exercer qualquer direito, entre em contato: <strong>contato@graneldapraca.com.br</strong>. Responderemos em até 15 dias.</p>

      <h2>7. Cookies</h2>
      <p>
        Usamos cookies essenciais, necessários para o funcionamento do site e do checkout. Também
        temos um sistema de consentimento para cookies não essenciais (análise de tráfego e
        publicidade): ao acessar o site pela primeira vez, você escolhe aceitar ou recusar esse tipo
        de cookie pelo banner exibido na tela.
      </p>
      <p>
        No momento, nenhum serviço externo de análise ou publicidade está conectado ao site — sua
        escolha no banner ainda não ativa nenhum rastreamento de terceiros. Quando um serviço desse
        tipo (como Google Analytics) for ativado, esta política será atualizada para nomear o serviço
        específico e sua finalidade.
      </p>

      <h2>8. Segurança</h2>
      <p>
        Adotamos medidas técnicas e administrativas para proteger seus dados contra acesso não
        autorizado, perda ou vazamento, incluindo controle de acesso por perfil (admin/cliente) e
        infraestrutura com criptografia em trânsito.
      </p>

      <h2>9. Encarregado de Proteção de Dados (DPO)</h2>
      <p>E-mail: <strong>contato@graneldapraca.com.br</strong></p>

      <h2>10. Alterações desta política</h2>
      <p>Podemos atualizar esta política periodicamente. A data da última atualização está sempre indicada no topo deste documento.</p>
    </LegalPageLayout>
  )
}
