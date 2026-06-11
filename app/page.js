import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div className="container">
          <div className="badge-pill">Para clínicas dentárias em Portugal 🇵🇹</div>
          <h1>
            A sua clínica tem <em>centenas de pacientes inativos</em>.
            Nós trazemo-los de volta à cadeira.
          </h1>
          <p className="sub">
            O CadeiraCheia identifica automaticamente os pacientes que não voltam há 6, 12 ou 24
            meses e recupera-os com campanhas prontas a enviar — em conformidade com o RGPD.
          </p>
          <div className="hero-ctas">
            <Link href="/registar" className="btn btn-accent">
              Começar grátis — 2 minutos
            </Link>
            <Link href="/#roi" className="btn btn-outline">
              Ver as contas
            </Link>
          </div>
          <p className="note">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>O problema que está a custar-lhe milhares de euros por mês</h2>
          <p className="lead">
            Em média, 40% do ficheiro de pacientes de uma clínica dentária está inativo. Cada
            cadeira vazia é receita que não volta.
          </p>
          <div className="grid-3">
            <div className="card">
              <span className="icon">📉</span>
              <h3>Pacientes que desaparecem</h3>
              <p>
                Fazem um tratamento, prometem voltar para o check-up… e nunca mais aparecem. Sem um
                sistema de recall, ninguém dá por eles.
              </p>
            </div>
            <div className="card">
              <span className="icon">🪑</span>
              <h3>Cadeiras vazias na agenda</h3>
              <p>
                Buracos na agenda significam custos fixos (equipa, renda, equipamento) a correr sem
                produzir um cêntimo.
              </p>
            </div>
            <div className="card">
              <span className="icon">⏰</span>
              <h3>Ninguém tem tempo para ligar</h3>
              <p>
                A rececionista não consegue ligar a 300 pacientes inativos. As campanhas de
                reativação ficam sempre "para a semana".
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt" id="como-funciona">
        <div className="container">
          <h2>Como funciona</h2>
          <p className="lead">Da lista de pacientes à agenda cheia em três passos.</p>
          <div className="grid-3">
            <div className="card">
              <span className="step-num">1</span>
              <h3>Importe os seus pacientes</h3>
              <p>
                Exporte a lista do seu software de gestão clínica (CSV) e importe-a em segundos. O
                CadeiraCheia segmenta automaticamente quem está inativo há 6, 12 ou 24+ meses.
              </p>
            </div>
            <div className="card">
              <span className="step-num">2</span>
              <h3>Lance uma campanha em 1 clique</h3>
              <p>
                Escolha um segmento e um modelo de email ou SMS escrito por especialistas em
                marketing dentário — em português, pronto a enviar, com opção de remoção incluída.
              </p>
            </div>
            <div className="card">
              <span className="step-num">3</span>
              <h3>Veja a receita recuperada</h3>
              <p>
                Quando um paciente remarca, regista-o como recuperado com o valor do tratamento. O
                painel mostra-lhe exatamente quanto a ferramenta lhe rendeu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="roi">
        <div className="container">
          <div className="roi-box">
            <h2>Façamos as contas — é por isto que é uma decisão óbvia</h2>
            <div className="roi-figures">
              <div className="fig">
                <div className="num">300</div>
                <div className="lbl">pacientes inativos numa clínica média</div>
              </div>
              <div className="fig">
                <div className="num">5%</div>
                <div className="lbl">taxa de recuperação conservadora</div>
              </div>
              <div className="fig">
                <div className="num">€450</div>
                <div className="lbl">valor médio por paciente recuperado</div>
              </div>
              <div className="fig">
                <div className="num">€6.750</div>
                <div className="lbl">receita recuperada</div>
              </div>
            </div>
            <p style={{ fontSize: 18, maxWidth: 620, margin: '0 auto 28px', color: '#ccfbf1' }}>
              O plano Premium custa <strong>€49/mês</strong>. Um único paciente recuperado paga
              quase um ano de subscrição. Tudo o resto é lucro.
            </p>
            <Link href="/registar" className="btn btn-accent">
              Recuperar os meus pacientes
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Tudo o que precisa, nada do que não precisa</h2>
          <p className="lead">
            Não é mais um CRM complicado. É uma ferramenta com um único objetivo: encher a sua
            agenda.
          </p>
          <div className="grid-3">
            <div className="card">
              <span className="icon">🎯</span>
              <h3>Segmentação automática</h3>
              <p>Inativos 6–12 meses, 12–24 meses e 24+ meses, calculados a partir da última consulta.</p>
            </div>
            <div className="card">
              <span className="icon">✉️</span>
              <h3>Modelos prontos em português</h3>
              <p>Emails e SMS de reativação testados, com variáveis automáticas de nome e clínica.</p>
            </div>
            <div className="card">
              <span className="icon">🛡️</span>
              <h3>Conforme o RGPD</h3>
              <p>Consentimento por paciente, opção de remoção em todas as mensagens e dados alojados por si.</p>
            </div>
            <div className="card">
              <span className="icon">📊</span>
              <h3>Painel de receita recuperada</h3>
              <p>Saiba em euros quanto cada campanha rendeu. ROI visível, sem folhas de cálculo.</p>
            </div>
            <div className="card">
              <span className="icon">📥</span>
              <h3>Importação CSV universal</h3>
              <p>Funciona com a exportação de qualquer software de gestão clínica.</p>
            </div>
            <div className="card">
              <span className="icon">📱</span>
              <h3>Campanhas SMS</h3>
              <p>Exporte listas de SMS personalizadas para o segmento certo — o canal com mais taxa de resposta.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container faq" style={{ maxWidth: 760 }}>
          <h2>Perguntas frequentes</h2>
          <p className="lead">Tudo o que os gestores de clínica nos perguntam.</p>
          <details>
            <summary>Isto é compatível com o RGPD?</summary>
            <p>
              Sim. Só contactamos pacientes com consentimento registado, todas as mensagens incluem
              uma forma simples de remoção (opt-out) e os pacientes que pedem remoção são
              automaticamente excluídos de campanhas futuras. Os dados ficam na sua instalação — não
              os partilhamos com terceiros.
            </p>
          </details>
          <details>
            <summary>Preciso de saber de marketing?</summary>
            <p>
              Não. Os modelos de campanha já estão escritos e otimizados. Escolhe o segmento, revê o
              texto e envia. Demora menos de cinco minutos.
            </p>
          </details>
          <details>
            <summary>Funciona com o meu software de gestão clínica?</summary>
            <p>
              Sim. Basta exportar a sua lista de pacientes em CSV (nome, email, telefone, data da
              última consulta) — todos os softwares de gestão clínica têm esta exportação.
            </p>
          </details>
          <details>
            <summary>E se não recuperar nenhum paciente?</summary>
            <p>
              Pode começar no plano Essencial gratuito e testar com 50 pacientes. Só passa ao
              Premium quando vir resultados. E pode cancelar a subscrição em qualquer momento.
            </p>
          </details>
        </div>
      </section>

      <section className="section alt" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2>Quantos pacientes inativos tem a sua clínica?</h2>
          <p className="lead">Importe a sua lista e descubra em dois minutos. É grátis.</p>
          <Link href="/registar" className="btn btn-accent">
            Criar conta gratuita
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
