import { NextResponse } from 'next/server';
import { run } from '@/lib/db';

// Webhook do Stripe: ativa o Premium após o pagamento e desativa-o se a
// subscrição for cancelada. Configure o endpoint no painel do Stripe com os
// eventos: checkout.session.completed, customer.subscription.deleted.
export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 503 });
  }

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = Number(session.client_reference_id);
    if (userId) {
      await run(
        "UPDATE users SET plan = 'premium', stripe_customer_id = $1, stripe_subscription_id = $2 WHERE id = $3",
        [session.customer ?? null, session.subscription ?? null, userId]
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    await run("UPDATE users SET plan = 'gratis', stripe_subscription_id = NULL WHERE stripe_subscription_id = $1", [
      sub.id,
    ]);
  }

  return NextResponse.json({ received: true });
}
