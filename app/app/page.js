import Link from 'next/link';
import { q } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { segmentOf, SEGMENTS } from '@/lib/segments';
import { PLANS } from '@/lib/plans';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const patients = await q('SELECT * FROM patients WHERE user_id = $1', [user.id]);
  const campaigns = await q(
    'SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
    [user.id]
  );

  const counts = { ativo: 0, inativos_6m: 0, inativos_12m: 0, inativos_24m: 0 };
  for (const p of patients) counts[segmentOf(p)]++;
  const inactive = counts.inativos_6m + counts.inativos_12m + counts.inativos_24m;

  const recovered = patients.filter((p) => p.recovered_at);
  const recoveredRevenue = recovered.reduce((s, p) => s + (p.recovered_value || 0), 0);
  const monthlyCost = PLANS.premium.price;
  const potential = inactive * 0.05 * 450;

  return (
    <>
      <h1>Painel</h1>
      <p className="page-sub">Visão geral da recuperação de pacientes da {user.clinic_name}.</p>

      {user.plan !== 'premium' && inactive > 0 && (
        <div className="upgrade-banner">
          <div>
            <strong>
              Tem {inactive} pacientes inativos — cerca de €{Math.round(potential).toLocaleString('pt-PT')} de receita potencial.
            </strong>
            <p>O Premium desbloqueia campanhas ilimitadas, SMS e todos os modelos por €49/mês.</p>
          </div>
          <Link href="/app/conta" className="btn btn-accent btn-sm">
            Passar a Premium
          </Link>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi">
          <div className="num">{patients.length}</div>
          <div className="lbl">Pacientes na base</div>
        </div>
        <div className="kpi">
          <div className="num" style={{ color: 'var(--amber-600)' }}>{inactive}</div>
          <div className="lbl">Pacientes inativos</div>
        </div>
        <div className="kpi">
          <div className="num pos">{recovered.length}</div>
          <div className="lbl">Pacientes recuperados</div>
        </div>
        <div className="kpi">
          <div className="num pos">€{recoveredRevenue.toLocaleString('pt-PT')}</div>
          <div className="lbl">Receita recuperada</div>
        </div>
      </div>

      {recoveredRevenue > 0 && (
        <div className="card" style={{ marginBottom: 28, borderColor: 'var(--green-600)' }}>
          <h3>💶 Retorno do investimento</h3>
          <p>
            Já recuperou <strong>€{recoveredRevenue.toLocaleString('pt-PT')}</strong> em receita —{' '}
            <strong>{Math.round(recoveredRevenue / monthlyCost)}×</strong> o custo mensal do plano
            Premium (€{monthlyCost}/mês).
          </p>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3>Pacientes por segmento</h3>
          <div className="table-wrap" style={{ marginTop: 14, border: 'none' }}>
            <table>
              <tbody>
                <tr>
                  <td>Ativos (consulta há menos de 6 meses)</td>
                  <td style={{ textAlign: 'right' }}><span className="chip chip-green">{counts.ativo}</span></td>
                </tr>
                <tr>
                  <td>{SEGMENTS.inativos_6m.label}</td>
                  <td style={{ textAlign: 'right' }}><span className="chip chip-amber">{counts.inativos_6m}</span></td>
                </tr>
                <tr>
                  <td>{SEGMENTS.inativos_12m.label}</td>
                  <td style={{ textAlign: 'right' }}><span className="chip chip-amber">{counts.inativos_12m}</span></td>
                </tr>
                <tr>
                  <td>{SEGMENTS.inativos_24m.label}</td>
                  <td style={{ textAlign: 'right' }}><span className="chip chip-red">{counts.inativos_24m}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          {patients.length === 0 ? (
            <Link href="/app/pacientes" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
              Importar pacientes
            </Link>
          ) : (
            <Link href="/app/campanhas/nova" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
              Lançar campanha de reativação
            </Link>
          )}
        </div>

        <div className="card">
          <h3>Últimas campanhas</h3>
          {campaigns.length === 0 ? (
            <p style={{ marginTop: 10 }}>
              Ainda não lançou nenhuma campanha.{' '}
              <Link href="/app/campanhas/nova">Lance a primeira</Link> — demora 2 minutos.
            </p>
          ) : (
            <div className="table-wrap" style={{ marginTop: 14, border: 'none' }}>
              <table>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/app/campanhas/${c.id}`}>{c.name}</Link>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="chip chip-teal">{c.sent_count} contactados</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
