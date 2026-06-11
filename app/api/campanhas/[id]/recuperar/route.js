import { NextResponse } from 'next/server';
import { one, run } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api';

export const POST = apiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const campaign = await one('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [id, user.id]);
  if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });

  const { patient_id, value } = await req.json().catch(() => ({}));
  const recipient = await one(
    'SELECT * FROM campaign_recipients WHERE campaign_id = $1 AND patient_id = $2',
    [campaign.id, patient_id]
  );
  if (!recipient) return NextResponse.json({ error: 'Paciente não pertence à campanha.' }, { status: 404 });

  const recoveredValue = Number(value) || 0;
  await run("UPDATE campaign_recipients SET status = 'recuperado', recovered_value = $1 WHERE id = $2", [
    recoveredValue,
    recipient.id,
  ]);
  await run(
    "UPDATE patients SET recovered_at = now(), recovered_value = $1, last_visit = to_char(now(), 'YYYY-MM-DD') WHERE id = $2",
    [recoveredValue, patient_id]
  );

  return NextResponse.json({ ok: true });
});
