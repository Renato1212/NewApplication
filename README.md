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

A base de dados (SQLite) é criada automaticamente em `data/cadeiracheia.db`.

## Configuração de produção

Copie `.env.example` para `.env` e preencha:

1. **`AUTH_SECRET`** — segredo longo e aleatório para as sessões (obrigatório).
2. **Stripe** (pagamentos do Premium):
   - Crie um produto "CadeiraCheia Premium" com preço recorrente de €49/mês;
   - Preencha `STRIPE_SECRET_KEY` e `STRIPE_PRICE_ID`;
   - Crie um webhook para `https://o-seu-dominio/api/stripe/webhook` com os eventos
     `checkout.session.completed` e `customer.subscription.deleted` e preencha
     `STRIPE_WEBHOOK_SECRET`.
3. **SMTP** (envio das campanhas de email) — qualquer fornecedor: Brevo, Mailgun, Amazon SES…
   Sem SMTP, as campanhas ficam disponíveis para exportação em CSV personalizado.
4. **`DEMO_UPGRADE=1`** — apenas para demonstrações comerciais: ativa o Premium sem pagamento.

### Alojamento

A aplicação usa SQLite em disco, por isso precisa de um servidor com armazenamento persistente:
um VPS (Hetzner, OVH, Scaleway — fornecedores europeus, dados na UE), Railway ou Fly.io com
volume. Para dezenas/centenas de clínicas, SQLite é mais do que suficiente.

```bash
# exemplo num VPS
npm ci && npm run build
AUTH_SECRET=... APP_URL=https://cadeiracheia.pt npm start
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
