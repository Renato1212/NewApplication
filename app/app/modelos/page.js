import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { TEMPLATES } from '@/lib/templates';
import { SEGMENTS } from '@/lib/segments';

export default async function ModelosPage() {
  const user = await getCurrentUser();
  const isPremium = user.plan === 'premium';

  return (
    <>
      <h1>Modelos de campanha</h1>
      <p className="page-sub">
        Mensagens escritas para clínicas dentárias portuguesas, com opção de remoção (RGPD)
        incluída. Pode editá-las ao criar a campanha.
      </p>

      <div className="grid-2">
        {TEMPLATES.map((t) => {
          const locked = t.premium && !isPremium;
          return (
            <div key={t.id} className="card" style={{ opacity: locked ? 0.75 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <h3>
                  {t.channel === 'sms' ? '📱' : '✉️'} {t.name}
                </h3>
                {t.premium ? (
                  <span className="chip chip-amber">Premium{locked ? ' 🔒' : ''}</span>
                ) : (
                  <span className="chip chip-green">Incluído</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: '6px 0 12px' }}>
                Segmento sugerido: {SEGMENTS[t.segment]?.label}
              </p>
              {t.subject && (
                <p style={{ fontSize: 14 }}>
                  <strong>Assunto:</strong> {t.subject}
                </p>
              )}
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: 13.5,
                  color: 'var(--slate-700)',
                  background: 'var(--slate-50)',
                  padding: 14,
                  borderRadius: 8,
                  marginTop: 8,
                  maxHeight: 220,
                  overflow: 'auto',
                }}
              >
                {t.body}
              </pre>
              <div style={{ marginTop: 14 }}>
                {locked ? (
                  <Link href="/app/conta" className="btn btn-sm btn-accent">
                    Desbloquear com o Premium
                  </Link>
                ) : (
                  <Link href="/app/campanhas/nova" className="btn btn-sm btn-primary">
                    Usar este modelo
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
