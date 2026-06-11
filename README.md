# 🦷 CadeiraCheia

**Micro-SaaS de marketing de reativação para clínicas dentárias em Portugal.**

Toda a clínica dentária tem centenas de pacientes inativos no ficheiro — pessoas que fizeram um
tratamento e nunca mais voltaram. Cada cadeira vazia é receita perdida. O CadeiraCheia importa a
lista de pacientes, segmenta automaticamente os inativos (6–12, 12–24, 24+ meses) e recupera-os
com campanhas de email/SMS prontas a enviar, em conformidade com o RGPD — e mostra, em euros,
a receita recuperada.

## O argumento de venda (porque é uma decisão óbvia)

| Métrica | Valor |
| --- | --- |
| Pacientes inativos numa clínica média | ~300 |
| Taxa de recuperação conservadora | 5% |
| Valor médio por paciente recuperado | €450 |
| **Receita recuperada** | **€6.750** |
| Custo do plano Premium | €49/mês |

**Um único paciente recuperado paga 9 meses de subscrição.**

## Planos

- **Essencial (grátis):** até 50 pacientes, 1 campanha de email/mês, modelos básicos.
- **Premium (€49/mês):** pacientes e campanhas ilimitados, todos os modelos, campanhas SMS,
  relatório de ROI. Pagamento por Stripe, sem fidelização.

## Funcionalidades

- Importação CSV universal (compatível com a exportação de qualquer software de gestão clínica)
- Segmentação automática por data da última consulta
- 5 modelos de campanha em português europeu, escritos para o setor dentário
- Envio de emails por SMTP (qualquer fornecedor) ou exportação de CSV personalizado
- Campanhas SMS com exportação de listas personalizadas
- Registo de pacientes recuperados com valor do tratamento → painel de ROI
- RGPD: consentimento por paciente, opt-out automático, direito ao apagamento

## Como executar

```bash
npm install
npm run dev          # desenvolvimento — http://localhost:3000
npm run build && npm start   # produção
```

Precisa de uma base de dados **Postgres** (variável `DATABASE_URL`). O esquema é criado
automaticamente no primeiro acesso.

## Publicar na Vercel (recomendado)

1. Importe o repositório na Vercel (deploy normal de Next.js).
2. No projeto, abra **Storage → Create Database → Neon (Postgres, grátis)** e ligue-a ao
   projeto — a variável `DATABASE_URL` é injetada automaticamente.
3. Em **Settings → Environment Variables**, adicione `AUTH_SECRET` (segredo longo e aleatório)
   e, quando quiser cobrar, as variáveis do Stripe (abaixo).
4. Faça **Redeploy**. Pronto.

## Configuração de produção

Copie `.env.example` para `.env` e preencha:

1. **`DATABASE_URL`** — ligação Postgres (Neon, Supabase, ou um Postgres próprio).
2. **`AUTH_SECRET`** — segredo longo e aleatório para as sessões (obrigatório).
3. **Stripe** (pagamentos do Premium):
   - Crie um produto "CadeiraCheia Premium" com preço recorrente de €49/mês;
   - Preencha `STRIPE_SECRET_KEY` e `STRIPE_PRICE_ID`;
   - Crie um webhook para `https://o-seu-dominio/api/stripe/webhook` com os eventos
     `checkout.session.completed` e `customer.subscription.deleted` e preencha
     `STRIPE_WEBHOOK_SECRET`.
4. **SMTP** (envio das campanhas de email) — qualquer fornecedor: Brevo, Mailgun, Amazon SES…
   Sem SMTP, as campanhas ficam disponíveis para exportação em CSV personalizado.
5. **`DEMO_UPGRADE=1`** — apenas para demonstrações comerciais: ativa o Premium sem pagamento.

### Alojamento alternativo (VPS europeu)

Funciona em qualquer servidor Node com acesso a um Postgres — por exemplo um VPS na Hetzner,
OVH ou Scaleway (fornecedores europeus, dados na UE):

```bash
npm ci && npm run build
DATABASE_URL=postgres://... AUTH_SECRET=... APP_URL=https://cadeiracheia.pt npm start
```

## Demonstração rápida a um cliente

1. Crie uma conta com o nome da clínica do prospeto.
2. Importe o ficheiro `exemplo-pacientes.csv` (incluído no repositório).
3. Mostre o painel: "tem 14 pacientes inativos = €X de receita potencial".
4. Lance uma campanha com o modelo "Reativação suave" — demora 1 minuto.
5. Marque um paciente como recuperado com €450 e mostre o ROI no painel.

## Estrutura

- `app/` — páginas (landing, preços, autenticação, painel) e rotas de API
- `lib/` — base de dados, autenticação, segmentação, modelos de campanha, planos
- `components/` — componentes de cliente (formulários, ações)
