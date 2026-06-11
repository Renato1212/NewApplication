'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  async function sair() {
    await fetch('/api/auth/sair', { method: 'POST' });
    router.push('/');
    router.refresh();
  }
  return (
    <button
      onClick={sair}
      style={{
        background: 'none',
        border: 'none',
        color: '#99f6e4',
        cursor: 'pointer',
        fontSize: 14,
        padding: '6px 12px',
      }}
    >
      ← Terminar sessão
    </button>
  );
}
