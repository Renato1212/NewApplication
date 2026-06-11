import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (user.plan === 'premium') return NextResponse.json({ error: 'Já tem o plano Premium.' }, { status: 400 });

  // Modo de demonstração: ativa o Premium sem pagamento (apenas para demos comerciais).
  if (process.env.DEMO_UPGRADE === '1' && !process.env.STRIPE_SECRET_KEY) {
    db.prepare("UPDATE users SET plan = 'premium' WHERE id = ?").run(user.id);
    return NextResponse.json({ demo: true });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: 'O pagamento não está configurado. Defina STRIPE_SECRET_KEY e STRIPE_PRICE_ID.' },
      { status: 503 }
    );
  }

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: String(user.id),
    success_url: `${appUrl}/app/conta?sucesso=1`,
    cancel_url: `${appUrl}/app/conta?cancelado=1`,
    locale: 'pt',
  });

  return NextResponse.json({ url: session.url });
}
