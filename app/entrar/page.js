import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Entrar — CadeiraCheia' };

export default function EntrarPage() {
  return (
    <>
      <SiteHeader />
      <div className="form-card">
        <h1>Bem-vindo de volta</h1>
        <p className="sub">Entre na sua conta para gerir as suas campanhas.</p>
        <AuthForm mode="entrar" />
        <p style={{ marginTop: 18, fontSize: 14, color: 'var(--slate-500)' }}>
          Ainda não tem conta? <Link href="/registar">Criar conta gratuita</Link>
        </p>
      </div>
    </>
  );
}
