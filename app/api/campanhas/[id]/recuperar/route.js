import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(id, user.id);
  if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });

  const { patient_id, value } = await req.json().catch(() => ({}));
  const recipient = db
    .prepare('SELECT * FROM campaign_recipients WHERE campaign_id = ? AND patient_id = ?')
    .get(campaign.id, patient_id);
  if (!recipient) return NextResponse.json({ error: 'Paciente não pertence à campanha.' }, { status: 404 });

  const recoveredValue = Number(value) || 0;
  db.prepare("UPDATE campaign_recipients SET status = 'recuperado', recovered_value = ? WHERE id = ?").run(
    recoveredValue,
    recipient.id
  );
  db.prepare(
    "UPDATE patients SET recovered_at = datetime('now'), recovered_value = ?, last_visit = date('now') WHERE id = ?"
  ).run(recoveredValue, patient_id);

  return NextResponse.json({ ok: true });
}
