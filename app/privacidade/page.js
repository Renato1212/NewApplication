import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = { title: 'Privacidade e RGPD — CadeiraCheia' };

export default function PrivacidadePage() {
  return (
    <>
      <SiteHeader />
      <div className="legal">
        <h1>Privacidade e conformidade com o RGPD</h1>
        <p>
          O CadeiraCheia foi desenhado para clínicas dentárias que operam na União Europeia e trata
          dados pessoais de acordo com o Regulamento Geral sobre a Proteção de Dados (RGPD —
          Regulamento (UE) 2016/679).
        </p>
        <h2>Papéis e responsabilidades</h2>
        <p>
          A clínica é a <strong>responsável pelo tratamento</strong> dos dados dos seus pacientes.
          O CadeiraCheia atua como <strong>subcontratante</strong>, tratando os dados exclusivamente
          para os fins definidos pela clínica: comunicação de saúde e reativação de pacientes.
        </p>
        <h2>Princípios aplicados na ferramenta</h2>
        <ul>
          <li>
            <strong>Consentimento:</strong> cada paciente tem um campo de consentimento de
            comunicações. Pacientes sem consentimento nunca são incluídos em campanhas.
          </li>
          <li>
            <strong>Direito de oposição:</strong> todas as mensagens incluem uma forma simples de
            remoção. Pacientes removidos são excluídos automaticamente de campanhas futuras.
          </li>
          <li>
            <strong>Minimização de dados:</strong> apenas guardamos os dados estritamente
            necessários — nome, contacto, data da última consulta e tipo de tratamento.
          </li>
          <li>
            <strong>Direito ao apagamento:</strong> pode eliminar qualquer paciente, e todos os seus
            dados, em qualquer momento.
          </li>
        </ul>
        <h2>Recomendações à clínica</h2>
        <ul>
          <li>Importe apenas pacientes que consentiram receber comunicações da clínica.</li>
          <li>Responda prontamente a pedidos de remoção (responda "REMOVER") marcando o paciente como removido.</li>
          <li>Mantenha o seu registo de atividades de tratamento atualizado, mencionando esta ferramenta.</li>
        </ul>
        <h2>Contacto</h2>
        <p>Para questões de privacidade, contacte-nos através do email indicado na sua fatura.</p>
      </div>
      <SiteFooter />
    </>
  );
}
