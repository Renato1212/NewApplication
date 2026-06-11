import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q, one, fmtDate } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { SEGMENTS } from '@/lib/segments';
import RecoverButton from '@/components/RecoverButton';

const STATUS_CHIP = {
  enviado: ['chip-teal', 'Enviado'],
  pendente: ['chip-amber', 'Por enviar (exportar)'],
  falhou: ['chip-red', 'Falhou'],
  recuperado: ['chip-green', 'Recuperado'],
};

export default async function CampanhaDetalhePage({ params }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const campaign = await one('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [id, user.id]);
  if (!campaign) notFound();

  const recipients = await q(
    `SELECT r.*, p.name, p.email, p.phone FROM campaign_recipients r
     JOIN patients p ON p.id = r.patient_id
     WHERE r.campaign_id = $1 ORDER BY r.id`,
    [campaign.id]
  );

  const recovered = recipients.filter((r) => r.status === 'recuperado');
  const revenue = recovered.reduce((s, r) => s + (r.recovered_value || 0), 0);
  const hasPending = recipients.some((r) => r.status === 'pendente');

  return (
    <>
      <p style={{ marginBottom: 8 }}>
        <Link href="/app/campanhas">← Todas as campanhas</Link>
      </p>
      <h1>{campaign.name}</h1>
      <p className="page-sub">
        {SEGMENTS[campaign.segment]?.label || campaign.segment} ·{' '}
        {campaign.channel === 'sms' ? 'SMS' : 'Email'} · {fmtDate(campaign.created_at)}
      </p>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi">
          <div className="num">{recipients.length}</div>
          <div className="lbl">Pacientes contactados</div>
        </div>
        <div className="kpi">
          <div className="num pos">{recovered.length}</div>
          <div className="lbl">Recuperados</div>
        </div>
        <div className="kpi">
          <div className="num pos">€{revenue.toLocaleString('pt-PT')}</div>
          <div className="lbl">Receita desta campanha</div>
        </div>
      </div>

      {hasPending && (
        <div className="upgrade-banner" style={{ background: 'var(--slate-700)' }}>
          <div>
            <strong>Mensagens por enviar</strong>
            <p>
              {campaign.channel === 'sms'
                ? 'Exporte a lista personalizada e envie-a pelo seu gateway de SMS habitual.'
                : 'O envio SMTP não está configurado. Exporte a lista personalizada e envie pelo seu email.'}
            </p>
          </div>
          <a href={`/api/campanhas/${campaign.id}/exportar`} className="btn btn-accent btn-sm">
            📥 Exportar CSV personalizado
          </a>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Mensagem enviada</h3>
        {campaign.subject && (
          <p style={{ marginTop: 8 }}>
            <strong>Assunto:</strong> {campaign.subject}
          </p>
        )}
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: 8, color: 'var(--slate-700)' }}>
          {campaign.body}
        </pre>
      </div>

      <h3 style={{ marginBottom: 12 }}>Pacientes — marque quem remarcou consulta</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((r) => {
              const [chip, label] = STATUS_CHIP[r.status] || ['chip-slate', r.status];
              return (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td>{campaign.channel === 'sms' ? r.phone : r.email}</td>
                  <td>
                    <span className={`chip ${chip}`}>
                      {label}
                      {r.status === 'recuperado' && r.recovered_value ? ` · €${r.recovered_value}` : ''}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {r.status !== 'recuperado' && (
                      <RecoverButton campaignId={campaign.id} patientId={r.patient_id} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
