import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = { title: 'Preços — CadeiraCheia' };

export default function PrecosPage() {
  return (
    <>
      <SiteHeader />
      <section className="section">
        <div className="container">
          <h2 style={{ marginTop: 24 }}>Preços simples, retorno óbvio</h2>
          <p className="lead">
            Um paciente recuperado vale em média €450. O Premium custa €49/mês. As contas fazem-se
            sozinhas.
          </p>
          <div className="pricing-grid">
            <div className="card price-card">
              <h3>Essencial</h3>
              <div className="price">
                €0 <small>/mês</small>
              </div>
              <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>
                Para experimentar e ver os primeiros resultados.
              </p>
              <ul>
                <li>Até 50 pacientes</li>
                <li>Segmentação automática de inativos</li>
                <li>1 campanha de email por mês</li>
                <li>Modelos básicos de reativação</li>
                <li>Painel de receita recuperada</li>
                <li className="no">Campanhas SMS</li>
                <li className="no">Modelos premium</li>
              </ul>
              <Link href="/registar" className="btn btn-outline">
                Começar grátis
              </Link>
            </div>
            <div className="card price-card featured">
              <span className="tag">RECOMENDADO — PAGA-SE SOZINHO</span>
              <h3>Premium</h3>
              <div className="price">
                €49 <small>/mês · sem fidelização</small>
              </div>
              <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>
                Para clínicas que querem a agenda cheia todos os meses.
              </p>
              <ul>
                <li>Pacientes ilimitados</li>
                <li>Campanhas ilimitadas</li>
                <li>Todos os modelos premium (incentivo, última chamada, higienização)</li>
                <li>Campanhas SMS com exportação de listas</li>
                <li>Relatório de ROI por campanha</li>
                <li>Suporte prioritário por email</li>
              </ul>
              <Link href="/registar" className="btn btn-primary">
                Ativar o Premium
              </Link>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--slate-500)', fontSize: 14 }}>
            Pagamento seguro por Stripe · Fatura com IVA · Cancele em qualquer momento na sua conta
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
