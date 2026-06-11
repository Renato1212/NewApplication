import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api';

async function ownPatient(params) {
  const user = await getCurrentUser();
  if (!user) return [null, null];
  const { id } = await params;
  const patient = await one('SELECT * FROM patients WHERE id = $1 AND user_id = $2', [id, user.id]);
  return [user, patient];
}

export const PATCH = apiHandler(async (req, { params }) => {
  const [user, patient] = await ownPatient(params);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!patient) return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (body.recovered) {
    await run(
      "UPDATE patients SET recovered_at = now(), recovered_value = $1, last_visit = to_char(now(), 'YYYY-MM-DD') WHERE id = $2",
      [Number(body.recovered_value) || 0, patient.id]
    );
  }
  if (body.opted_out !== undefined) {
    await run('UPDATE patients SET opted_out = $1 WHERE id = $2', [body.opted_out ? 1 : 0, patient.id]);
  }
  if (body.consent !== undefined) {
    await run('UPDATE patients SET consent = $1 WHERE id = $2', [body.consent ? 1 : 0, patient.id]);
  }
  return NextResponse.json({ ok: true });
});

export const DELETE = apiHandler(async (req, { params }) => {
  const [user, patient] = await ownPatient(params);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!patient) return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 });

  await run('DELETE FROM campaign_recipients WHERE patient_id = $1', [patient.id]);
  await run('DELETE FROM patients WHERE id = $1', [patient.id]);
  return NextResponse.json({ ok: true });
});
