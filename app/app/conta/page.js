import { getCurrentUser } from '@/lib/auth';
import { planOf, PLANS } from '@/lib/plans';
import UpgradeButton from '@/components/UpgradeButton';

export default async function ContaPage({ searchParams }) {
  const user = await getCurrentUser();
  const plan = planOf(user);
  const sp = await searchParams;
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
  const demoUpgrade = process.env.DEMO_UPGRADE === '1';

  return (
    <>
      <h1>Conta e subscrição</h1>
      <p className="page-sub">{user.clinic_name} · {user.email}</p>

      {sp?.sucesso && (
        <div className="form-success">
          Pagamento concluído! O seu plano Premium fica ativo assim que o Stripe confirmar o
          pagamento (normalmente em segundos). Atualize a página.
        </div>
      )}
      {sp?.cancelado && (
        <div className="form-error">O pagamento foi cancelado. Pode tentar novamente quando quiser.</div>
      )}

      <div className="pricing-grid" style={{ maxWidth: 'none' }}>
        <div className={`card price-card ${user.plan !== 'premium' ? 'featured' : ''}`}>
          <h3>Plano atual: {plan.label}</h3>
          <div className="price">
            €{plan.price} <small>/mês</small>
          </div>
          <ul>
            <li>
              {plan.maxPatients === Infinity ? 'Pacientes ilimitados' : `Até ${plan.maxPatients} pacientes`}
            </li>
            <li>
              {plan.maxCampaignsPerMonth === Infinity
                ? 'Campanhas ilimitadas'
                : `${plan.maxCampaignsPerMonth} campanha de email por mês`}
            </li>
            <li className={plan.premiumTemplates ? '' : 'no'}>Modelos premium</li>
            <li className={plan.smsExport ? '' : 'no'}>Campanhas SMS</li>
          </ul>
          {user.plan === 'premium' && (
            <p style={{ fontSize: 14, color: 'var(--slate-500)' }}>
              Obrigado por ser cliente Premium. Para cancelar ou alterar o método de pagamento,
              utilize o portal do Stripe no email de fatura, ou contacte o suporte.
            </p>
          )}
        </div>

        {user.plan !== 'premium' && (
          <div className="card price-card">
            <h3>Premium</h3>
            <div className="price">
              €{PLANS.premium.price} <small>/mês · sem fidelização</small>
            </div>
            <ul>
              <li>Pacientes ilimitados</li>
              <li>Campanhas ilimitadas</li>
              <li>Todos os modelos premium</li>
              <li>Campanhas SMS com exportação</li>
              <li>Suporte prioritário</li>
            </ul>
            <UpgradeButton stripeReady={stripeReady} demoUpgrade={demoUpgrade} />
            <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 12 }}>
              Pagamento seguro por Stripe. Um paciente recuperado (€450 em média) paga 9 meses de
              subscrição.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
