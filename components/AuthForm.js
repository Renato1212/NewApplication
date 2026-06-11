'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch(mode === 'registar' ? '/api/auth/registar' : '/api/auth/entrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push('/app');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Ocorreu um erro. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="form-error">{error}</div>}
      {mode === 'registar' && (
        <div className="field">
          <label htmlFor="clinic_name">Nome da clínica</label>
          <input id="clinic_name" name="clinic_name" required placeholder="Clínica Dentária Sorriso" />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="gerencia@suaclinica.pt" />
      </div>
      <div className="field">
        <label htmlFor="password">Palavra-passe</label>
        <input id="password" name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Aguarde…' : mode === 'registar' ? 'Criar conta gratuita' : 'Entrar'}
      </button>
    </form>
  );
}
