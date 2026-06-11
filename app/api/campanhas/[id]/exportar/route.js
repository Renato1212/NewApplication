import { NextResponse } from 'next/server';
import { q, one } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { renderTemplate } from '@/lib/templates';
import { apiHandler } from '@/lib/api';

// Exporta a lista de contactos da campanha com a mensagem personalizada,
// pronta a colar num gateway de SMS ou cliente de email.
export const GET = apiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const campaign = await one('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [id, user.id]);
  if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });

  const plan = planOf(user);
  if (campaign.channel === 'sms' && !plan.smsExport) {
    return NextResponse.json({ error: 'A exportação SMS está disponível no plano Premium.' }, { status: 402 });
  }

  const rows = await q(
    `SELECT p.name, p.email, p.phone FROM campaign_recipients r
     JOIN patients p ON p.id = r.patient_id
     WHERE r.campaign_id = $1`,
    [campaign.id]
  );

  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const contactCol = campaign.channel === 'sms' ? 'telefone' : 'email';
  const lines = [`nome,${contactCol},mensagem`];
  for (const r of rows) {
    const msg = renderTemplate(campaign.body, { nome: r.name, clinica: user.clinic_name });
    lines.push([esc(r.name), esc(campaign.channel === 'sms' ? r.phone : r.email), esc(msg)].join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="campanha-${campaign.id}.csv"`,
    },
  });
});
