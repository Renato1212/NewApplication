import './globals.css';

export const metadata = {
  title: 'CadeiraCheia — Recupere pacientes inativos da sua clínica dentária',
  description:
    'Software de marketing de reativação para clínicas dentárias em Portugal. Importe a sua lista de pacientes, identifique os inativos e recupere-os com campanhas prontas a enviar, em conformidade com o RGPD.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
