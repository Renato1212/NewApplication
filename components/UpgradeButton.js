'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpgradeButton({ stripeReady, demoUpgrade }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function upgrade() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else if (res.ok && data.demo) {
      router.refresh();
    } else {
      setError(data.error || 'Não foi possível iniciar o pagamento.');
      setLoading(false);
    }
  }

  if (!stripeReady && !demoUpgrade) {
    return (
      <p style={{ fontSize: 14, color: 'var(--slate-500)' }}>
        ⚙️ O pagamento ainda não está configurado nesta instalação. Defina as variáveis
        STRIPE_SECRET_KEY e STRIPE_PRICE_ID (ver .env.example).
      </p>
    );
  }

  return (
    <>
      {error && <div className="form-error">{error}</div>}
      <button className="btn btn-accent" onClick={upgrade} disabled={loading}>
        {loading ? 'A redirecionar…' : 'Ativar o Premium — €49/mês'}
      </button>
    </>
  );
}
