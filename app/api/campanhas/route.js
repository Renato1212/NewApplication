import { NextResponse } from 'next/server';
import { q, one, run, tx } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { contactablePatients, SEGMENTS } from '@/lib/segments';
import { renderTemplate } from '@/lib/templates';
import { sendEmail, smtpConfigured } from '@/lib/mailer';
import { apiHandler } from '@/lib/api';

export const POST = apiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const plan = planOf(user);
  const { name, segment, channel, subject, body } = await req.json().catch(() => ({}));

  if (!SEGMENTS[segment]) return NextResponse.json({ error: 'Segmento inválido.' }, { status: 400 });
  if (!body?.trim()) return NextResponse.json({ error: 'A mensagem não pode estar vazia.' }, { status: 400 });
  if (channel === 'email' && !subject?.trim()) {
    return NextResponse.json({ error: 'O assunto do email é obrigatório.' }, { status: 400 });
  }
  if (channel === 'sms' && !plan.smsExport) {
    return NextResponse.json({ error: 'As campanhas SMS estão disponíveis no plano Premium.' }, { status: 402 });
  }

  if (plan.maxCampaignsPerMonth !== Infinity) {
    const { n } = await one(
      "SELECT COUNT(*)::int AS n FROM campaigns WHERE user_id = $1 AND created_at >= date_trunc('month', now())",
      [user.id]
    );
    if (n >= plan.maxCampaignsPerMonth) {
      return NextResponse.json(
        { error: `O plano ${plan.label} permite ${plan.maxCampaignsPerMonth} campanha por mês. Passe a Premium para campanhas ilimitadas.` },
        { status: 402 }
      );
    }
  }

  const patients = await q('SELECT * FROM patients WHERE user_id = $1', [user.id]);
  const recipients = contactablePatients(patients, segment, channel);
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'Não há pacientes contactáveis neste segmento.' }, { status: 400 });
  }

  const campaign = await one(
    'INSERT INTO campaigns (user_id, name, segment, channel, subject, body) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [user.id, (name || 'Campanha').trim(), segment, channel, subject?.trim() || null, body.trim()]
  );
  const campaignId = campaign.id;

  const insertRecipient = (patientId, status) =>
    run('INSERT INTO campaign_recipients (campaign_id, patient_id, status) VALUES ($1, $2, $3)', [
      campaignId,
      patientId,
      status,
    ]);

  let sent = 0;
  let failed = 0;

  if (channel === 'email' && smtpConfigured()) {
    for (const p of recipients) {
      const vars = { nome: p.name, clinica: user.clinic_name };
      try {
        await sendEmail({
          to: p.email,
          subject: renderTemplate(subject, vars),
          text: renderTemplate(body, vars),
        });
        await insertRecipient(p.id, 'enviado');
        sent++;
      } catch {
        await insertRecipient(p.id, 'falhou');
        failed++;
      }
    }
  } else {
    // Sem SMTP (ou canal SMS): a campanha fica pronta para exportação manual.
    await tx(async (client) => {
      for (const p of recipients) {
        await client.query(
          "INSERT INTO campaign_recipients (campaign_id, patient_id, status) VALUES ($1, $2, 'pendente')",
          [campaignId, p.id]
        );
      }
    });
    sent = recipients.length;
  }

  await run('UPDATE campaigns SET sent_count = $1 WHERE id = $2', [recipients.length, campaignId]);

  return NextResponse.json({
    id: campaignId,
    sent,
    failed,
    delivery: channel === 'email' && smtpConfigured() ? 'smtp' : 'exportacao',
  });
});
