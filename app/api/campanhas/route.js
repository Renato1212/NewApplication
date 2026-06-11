import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { contactablePatients, SEGMENTS } from '@/lib/segments';
import { renderTemplate } from '@/lib/templates';
import { sendEmail, smtpConfigured } from '@/lib/mailer';

export async function POST(req) {
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
    const thisMonth = db
      .prepare("SELECT COUNT(*) AS n FROM campaigns WHERE user_id = ? AND created_at >= date('now','start of month')")
      .get(user.id).n;
    if (thisMonth >= plan.maxCampaignsPerMonth) {
      return NextResponse.json(
        { error: `O plano ${plan.label} permite ${plan.maxCampaignsPerMonth} campanha por mês. Passe a Premium para campanhas ilimitadas.` },
        { status: 402 }
      );
    }
  }

  const patients = db.prepare('SELECT * FROM patients WHERE user_id = ?').all(user.id);
  const recipients = contactablePatients(patients, segment, channel);
  if (recipients.length === 0) {
    return NextResponse.json({ error: 'Não há pacientes contactáveis neste segmento.' }, { status: 400 });
  }

  const result = db
    .prepare('INSERT INTO campaigns (user_id, name, segment, channel, subject, body) VALUES (?, ?, ?, ?, ?, ?)')
    .run(user.id, (name || 'Campanha').trim(), segment, channel, subject?.trim() || null, body.trim());
  const campaignId = result.lastInsertRowid;

  const insertRecipient = db.prepare(
    'INSERT INTO campaign_recipients (campaign_id, patient_id, status) VALUES (?, ?, ?)'
  );

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
        insertRecipient.run(campaignId, p.id, 'enviado');
        sent++;
      } catch {
        insertRecipient.run(campaignId, p.id, 'falhou');
        failed++;
      }
    }
  } else {
    // Sem SMTP (ou canal SMS): a campanha fica pronta para exportação manual.
    const tx = db.transaction(() => {
      for (const p of recipients) insertRecipient.run(campaignId, p.id, 'pendente');
    });
    tx();
    sent = recipients.length;
  }

  db.prepare('UPDATE campaigns SET sent_count = ? WHERE id = ?').run(recipients.length, campaignId);

  return NextResponse.json({
    id: Number(campaignId),
    sent,
    failed,
    delivery: channel === 'email' && smtpConfigured() ? 'smtp' : 'exportacao',
  });
}
