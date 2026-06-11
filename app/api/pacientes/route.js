import { NextResponse } from 'next/server';
import { q, one, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { apiHandler } from '@/lib/api';

export const GET = apiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const patients = await q('SELECT * FROM patients WHERE user_id = $1', [user.id]);
  return NextResponse.json({ patients });
});

export const POST = apiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const plan = planOf(user);
  const { n } = await one('SELECT COUNT(*)::int AS n FROM patients WHERE user_id = $1', [user.id]);
  if (n >= plan.maxPatients) {
    return NextResponse.json(
      { error: `O plano ${plan.label} permite até ${plan.maxPatients} pacientes. Passe a Premium para pacientes ilimitados.` },
      { status: 402 }
    );
  }

  const { name, email, phone, last_visit, last_treatment, consent } = await req.json().catch(() => ({}));
  if (!name?.trim()) {
    return NextResponse.json({ error: 'O nome do paciente é obrigatório.' }, { status: 400 });
  }
  await run(
    'INSERT INTO patients (user_id, name, email, phone, last_visit, last_treatment, consent) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      user.id,
      name.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      last_visit || null,
      last_treatment?.trim() || null,
      consent ? 1 : 0,
    ]
  );
  return NextResponse.json({ ok: true });
});
