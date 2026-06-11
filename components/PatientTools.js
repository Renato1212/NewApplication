'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientTools({ patientCount, maxPatients }) {
  const router = useRouter();
  const [mode, setMode] = useState(null); // 'csv' | 'manual' | null
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const atLimit = maxPatients !== null && patientCount >= maxPatients;

  async function importCsv(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const file = e.currentTarget.elements.ficheiro.files[0];
    const text = await file.text();
    const res = await fetch('/api/pacientes/importar', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: text,
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: `Importados ${data.imported} pacientes (${data.skipped} ignorados).` });
      router.refresh();
    } else {
      setMsg({ ok: false, text: data.error || 'Erro na importação.' });
    }
  }

  async function addManual(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    body.consent = body.consent ? 1 : 0;
    const res = await fetch('/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: 'Paciente adicionado.' });
      e.target.reset?.();
      router.refresh();
    } else {
      setMsg({ ok: false, text: data.error || 'Erro ao adicionar paciente.' });
    }
  }

  return (
    <div style={{ marginBottom: 22 }}>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setMode(mode === 'csv' ? null : 'csv')}>
            📥 Importar CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setMode(mode === 'manual' ? null : 'manual')}>
            + Adicionar paciente
          </button>
        </div>
        {atLimit && (
          <span className="chip chip-amber">
            Limite do plano atingido — passe a Premium para pacientes ilimitados
          </span>
        )}
      </div>

      {msg && <div className={msg.ok ? 'form-success' : 'form-error'}>{msg.text}</div>}

      {mode === 'csv' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Importar ficheiro CSV</h3>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            Colunas esperadas (com cabeçalho): <code>nome, email, telefone, ultima_consulta, tratamento</code>.
            A data deve estar no formato <code>AAAA-MM-DD</code>. Importe apenas pacientes que
            consentiram receber comunicações da clínica (RGPD).
          </p>
          <form onSubmit={importCsv} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" name="ficheiro" accept=".csv,text/csv" required />
            <button className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'A importar…' : 'Importar'}
            </button>
          </form>
        </div>
      )}

      {mode === 'manual' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Adicionar paciente</h3>
          <form onSubmit={addManual}>
            <div className="grid-2" style={{ gap: 12, marginTop: 10 }}>
              <div className="field">
                <label>Nome *</label>
                <input name="name" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input name="phone" />
              </div>
              <div className="field">
                <label>Última consulta (AAAA-MM-DD)</label>
                <input name="last_visit" type="date" />
              </div>
              <div className="field">
                <label>Último tratamento</label>
                <input name="last_treatment" placeholder="Destartarização, ortodontia…" />
              </div>
              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <input type="checkbox" name="consent" defaultChecked id="consent" style={{ width: 'auto' }} />
                <label htmlFor="consent" style={{ margin: 0 }}>Consentiu receber comunicações</label>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'A guardar…' : 'Guardar paciente'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
