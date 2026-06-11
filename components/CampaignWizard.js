'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SEGMENTS, contactablePatients } from '@/lib/segments';

export default function CampaignWizard({ templates, isPremium, clinicName, smsAllowed }) {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [segment, setSegment] = useState(templates[0].segment);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(templates[0].subject || '');
  const [body, setBody] = useState(templates[0].body);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const template = templates.find((t) => t.id === templateId);
  const channel = template?.channel || 'email';
  const locked = template?.premium && !isPremium;

  useEffect(() => {
    fetch('/api/pacientes')
      .then((r) => r.json())
      .then((d) => setPatients(d.patients || []))
      .catch(() => {});
  }, []);

  function pickTemplate(id) {
    const t = templates.find((x) => x.id === id);
    setTemplateId(id);
    setSegment(t.segment);
    setSubject(t.subject || '');
    setBody(t.body);
    if (!name) setName(t.name);
  }

  const recipients = useMemo(
    () => contactablePatients(patients, segment, channel),
    [patients, segment, channel]
  );

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/campanhas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || template.name, segment, channel, subject, body }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(`/app/campanhas/${data.id}`);
      router.refresh();
    } else {
      setError(data.error || 'Erro ao criar a campanha.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="form-error">{error}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>1. Escolha o modelo</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {templates.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => pickTemplate(t.id)}
              className="btn btn-sm"
              style={{
                border: t.id === templateId ? '2px solid var(--teal-600)' : '1px solid var(--slate-200)',
                background: t.id === templateId ? 'var(--teal-50)' : '#fff',
                color: 'var(--slate-700)',
              }}
            >
              {t.channel === 'sms' ? '📱 ' : '✉️ '}
              {t.name}
              {t.premium && !isPremium && ' 🔒'}
            </button>
          ))}
        </div>
        {locked && (
          <p style={{ marginTop: 12, fontSize: 14 }}>
            🔒 Este modelo faz parte do plano <strong>Premium</strong>.{' '}
            <Link href="/app/conta">Ative o Premium</Link> para o utilizar.
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>2. Segmento a contactar</h3>
        <div className="field" style={{ marginTop: 12, maxWidth: 420 }}>
          <select value={segment} onChange={(e) => setSegment(e.target.value)}>
            {Object.entries(SEGMENTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <p style={{ fontSize: 14, color: 'var(--slate-500)' }}>{SEGMENTS[segment]?.description}</p>
        <p style={{ marginTop: 8 }}>
          <span className={`chip ${recipients.length > 0 ? 'chip-teal' : 'chip-slate'}`}>
            {recipients.length} pacientes contactáveis
          </span>{' '}
          <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>
            (com consentimento, sem pedido de remoção e com {channel === 'sms' ? 'telefone' : 'email'})
          </span>
        </p>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>3. Reveja a mensagem</h3>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Nome da campanha</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={template?.name} />
        </div>
        {channel === 'email' && (
          <div className="field">
            <label>Assunto</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label>{channel === 'sms' ? 'Texto do SMS' : 'Corpo do email'}</label>
          <textarea rows={channel === 'sms' ? 4 : 14} value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <details style={{ fontSize: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Pré-visualizar com dados reais</summary>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              background: 'var(--slate-50)',
              padding: 16,
              borderRadius: 8,
              marginTop: 10,
            }}
          >
            {body
              .replaceAll('{nome}', recipients[0]?.name || 'Maria Santos')
              .replaceAll('{clinica}', clinicName)}
          </pre>
        </details>
      </div>

      <button
        className="btn btn-accent"
        disabled={loading || locked || recipients.length === 0 || (channel === 'sms' && !smsAllowed)}
      >
        {loading
          ? 'A criar campanha…'
          : channel === 'sms'
            ? `Criar campanha SMS para ${recipients.length} pacientes`
            : `Enviar a ${recipients.length} pacientes`}
      </button>
      {channel === 'sms' && !smsAllowed && (
        <p style={{ marginTop: 10, fontSize: 14 }}>
          📱 As campanhas SMS estão disponíveis no plano <strong>Premium</strong>.{' '}
          <Link href="/app/conta">Ativar Premium</Link>
        </p>
      )}
    </form>
  );
}
