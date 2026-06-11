import Link from 'next/link';
import { q, fmtDate } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { SEGMENTS } from '@/lib/segments';

export default async function CampanhasPage() {
  const user = await getCurrentUser();
  const campaigns = await q(
    `SELECT c.*,
      (SELECT COUNT(*)::int FROM campaign_recipients r WHERE r.campaign_id = c.id AND r.status = 'recuperado') AS recovered,
      (SELECT COALESCE(SUM(r.recovered_value), 0)::float FROM campaign_recipients r WHERE r.campaign_id = c.id) AS revenue
     FROM campaigns c WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
    [user.id]
  );

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>Campanhas</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Cada campanha contacta um segmento de pacientes inativos.
          </p>
        </div>
        <Link href="/app/campanhas/nova" className="btn btn-primary">
          + Nova campanha
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📣</span>
          Ainda não lançou campanhas. A primeira demora menos de 5 minutos — escolha um modelo, um
          segmento e envie.
          <div style={{ marginTop: 16 }}>
            <Link href="/app/campanhas/nova" className="btn btn-primary btn-sm">
              Lançar a primeira campanha
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Segmento</th>
                <th>Canal</th>
                <th>Contactados</th>
                <th>Recuperados</th>
                <th>Receita</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/app/campanhas/${c.id}`}>
                      <strong>{c.name}</strong>
                    </Link>
                  </td>
                  <td>{SEGMENTS[c.segment]?.label || c.segment}</td>
                  <td>
                    <span className="chip chip-teal">{c.channel === 'sms' ? 'SMS' : 'Email'}</span>
                  </td>
                  <td>{c.sent_count}</td>
                  <td>
                    {c.recovered > 0 ? <span className="chip chip-green">{c.recovered}</span> : '—'}
                  </td>
                  <td>{c.revenue > 0 ? `€${c.revenue.toLocaleString('pt-PT')}` : '—'}</td>
                  <td>{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
