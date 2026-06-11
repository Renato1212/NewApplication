import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Criar conta — CadeiraCheia' };

export default function RegistarPage() {
  return (
    <>
      <SiteHeader />
      <div className="form-card">
        <h1>Crie a sua conta gratuita</h1>
        <p className="sub">Importe os seus pacientes e descubra quantos estão inativos — em 2 minutos.</p>
        <AuthForm mode="registar" />
        <p style={{ marginTop: 18, fontSize: 14, color: 'var(--slate-500)' }}>
          Já tem conta? <Link href="/entrar">Entrar</Link>
        </p>
      </div>
    </>
  );
}
