import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
          Cadeira<span>Cheia</span>
        </Link>
        <nav className="site-nav">
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/precos">Preços</Link>
          <Link href="/entrar">Entrar</Link>
          <Link href="/registar" className="btn btn-primary btn-sm">
            Começar grátis
          </Link>
        </nav>
      </div>
    </header>
  );
}
