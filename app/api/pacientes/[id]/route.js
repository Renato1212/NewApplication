import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

async function ownPatient(req, params) {
  const user = await getCurrentUser();
  if (!user) return [null, null];
  const { id } = await params;
  const patient = db.prepare('SELECT * FROM patients WHERE id = ? AND user_id = ?').get(id, user.id);
  return [user, patient];
}

export async function PATCH(req, { params }) {
  const [user, patient] = await ownPatient(req, params);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!patient) return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (body.recovered) {
    db.prepare(
      "UPDATE patients SET recovered_at = datetime('now'), recovered_value = ?, last_visit = date('now') WHERE id = ?"
    ).run(Number(body.recovered_value) || 0, patient.id);
  }
  if (body.opted_out !== undefined) {
    db.prepare('UPDATE patients SET opted_out = ? WHERE id = ?').run(body.opted_out ? 1 : 0, patient.id);
  }
  if (body.consent !== undefined) {
    db.prepare('UPDATE patients SET consent = ? WHERE id = ?').run(body.consent ? 1 : 0, patient.id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const [user, patient] = await ownPatient(req, params);
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!patient) return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 });

  db.prepare('DELETE FROM campaign_recipients WHERE patient_id = ?').run(patient.id);
  db.prepare('DELETE FROM patients WHERE id = ?').run(patient.id);
  return NextResponse.json({ ok: true });
}
