import { NextResponse } from 'next/server';

// Envolve uma rota de API: erros inesperados passam a respostas JSON claras
// em vez de 500 opacos (ex.: base de dados por configurar).
export function apiHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      console.error('[api]', e);
      const msg =
        e?.message?.includes('DATABASE_URL') || e?.message?.includes('não configurada')
          ? e.message
          : 'Erro inesperado no servidor. Tente novamente.';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}
