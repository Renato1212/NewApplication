import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import LogoutButton from '@/components/LogoutButton';

export const metadata = { title: 'Painel — CadeiraCheia' };

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar');
  const plan = planOf(user);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/app" className="logo" style={{ textDecoration: 'none' }}>
          Cadeira<span>Cheia</span>
        </Link>
        <nav>
          <Link href="/app">📊 Painel</Link>
          <Link href="/app/pacientes">🦷 Pacientes</Link>
          <Link href="/app/campanhas">📣 Campanhas</Link>
          <Link href="/app/modelos">✉️ Modelos</Link>
          <Link href="/app/conta">⚙️ Conta</Link>
        </nav>
        <div className="plan-chip">
          <strong>{user.clinic_name}</strong>
          <br />
          Plano {plan.label}
          {user.plan !== 'premium' && (
            <>
              {' · '}
              <Link href="/app/conta" style={{ color: '#fbbf24' }}>
                Passar a Premium
              </Link>
            </>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <LogoutButton />
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
