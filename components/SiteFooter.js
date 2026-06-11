import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container inner">
        <div>
          © {new Date().getFullYear()} CadeiraCheia · Software de reativação de pacientes para
          clínicas dentárias
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <Link href="/privacidade">Privacidade e RGPD</Link>
          <Link href="/precos">Preços</Link>
          <Link href="/registar">Criar conta</Link>
        </div>
      </div>
    </footer>
  );
}
