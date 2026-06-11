import { q } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { segmentOf, SEGMENTS } from '@/lib/segments';
import { planOf } from '@/lib/plans';
import PatientTools from '@/components/PatientTools';
import PatientRowActions from '@/components/PatientRowActions';

const SEGMENT_CHIP = {
  ativo: ['chip-green', 'Ativo'],
  inativos_6m: ['chip-amber', 'Inativo 6–12m'],
  inativos_12m: ['chip-amber', 'Inativo 12–24m'],
  inativos_24m: ['chip-red', 'Inativo 24m+'],
};

export default async function PacientesPage() {
  const user = await getCurrentUser();
  const plan = planOf(user);
  const patients = await q(
    'SELECT * FROM patients WHERE user_id = $1 ORDER BY last_visit ASC NULLS FIRST',
    [user.id]
  );

  return (
    <>
      <h1>Pacientes</h1>
      <p className="page-sub">
        {patients.length} pacientes na base
        {plan.maxPatients !== Infinity && ` (limite do plano: ${plan.maxPatients})`}. A segmentação
        é automática a partir da data da última consulta.
      </p>

      <PatientTools patientCount={patients.length} maxPatients={plan.maxPatients === Infinity ? null : plan.maxPatients} />

      {patients.length === 0 ? (
        <div className="empty-state">
          <span className="icon">🦷</span>
          Ainda não tem pacientes. Importe um ficheiro CSV exportado do seu software de gestão
          clínica ou adicione pacientes manualmente.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contacto</th>
                <th>Última consulta</th>
                <th>Estado</th>
                <th>RGPD</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const seg = segmentOf(p);
                const [chip, label] = SEGMENT_CHIP[seg];
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.last_treatment && (
                        <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{p.last_treatment}</div>
                      )}
                    </td>
                    <td>
                      {p.email || '—'}
                      {p.phone && <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{p.phone}</div>}
                    </td>
                    <td>{p.last_visit || '—'}</td>
                    <td>
                      {p.recovered_at ? (
                        <span className="chip chip-green">
                          Recuperado{p.recovered_value ? ` · €${p.recovered_value}` : ''}
                        </span>
                      ) : (
                        <span className={`chip ${chip}`}>{label}</span>
                      )}
                    </td>
                    <td>
                      {p.opted_out ? (
                        <span className="chip chip-red">Removido</span>
                      ) : p.consent ? (
                        <span className="chip chip-green">Consentiu</span>
                      ) : (
                        <span className="chip chip-slate">Sem consent.</span>
                      )}
                    </td>
                    <td>
                      <PatientRowActions patient={{ id: p.id, recovered: Boolean(p.recovered_at), opted_out: Boolean(p.opted_out) }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
