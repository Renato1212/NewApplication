import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const patients = db.prepare('SELECT * FROM patients WHERE user_id = ?').all(user.id);
  return NextResponse.json({ patients });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const plan = planOf(user);
  const count = db.prepare('SELECT COUNT(*) AS n FROM patients WHERE user_id = ?').get(user.id).n;
  if (count >= plan.maxPatients) {
    return NextResponse.json(
      { error: `O plano ${plan.label} permite até ${plan.maxPatients} pacientes. Passe a Premium para pacientes ilimitados.` },
      { status: 402 }
    );
  }

  const { name, email, phone, last_visit, last_treatment, consent } = await req.json().catch(() => ({}));
  if (!name?.trim()) {
    return NextResponse.json({ error: 'O nome do paciente é obrigatório.' }, { status: 400 });
  }
  db.prepare(
    'INSERT INTO patients (user_id, name, email, phone, last_visit, last_treatment, consent) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    user.id,
    name.trim(),
    email?.trim() || null,
    phone?.trim() || null,
    last_visit || null,
    last_treatment?.trim() || null,
    consent ? 1 : 0
  );
  return NextResponse.json({ ok: true });
}
