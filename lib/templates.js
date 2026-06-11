// Modelos de campanha em português europeu, prontos a enviar.
// Variáveis disponíveis: {nome} — nome do paciente, {clinica} — nome da clínica.

export const TEMPLATES = [
  {
    id: 'reativacao_suave',
    name: 'Reativação suave (6–12 meses)',
    segment: 'inativos_6m',
    channel: 'email',
    premium: false,
    subject: 'Sentimos a sua falta, {nome} — está na hora do seu check-up',
    body: `Olá {nome},

Reparámos que já passou algum tempo desde a sua última consulta na {clinica}.

Os check-ups regulares são a forma mais simples (e mais barata) de evitar tratamentos complicados no futuro. Uma consulta de revisão demora menos de 30 minutos.

Responda a este email ou ligue-nos para marcar a sua consulta — temos horários disponíveis esta semana.

Até breve,
A equipa da {clinica}

—
Se não desejar receber mais emails da nossa clínica, basta responder com "REMOVER".`,
  },
  {
    id: 'reativacao_incentivo',
    name: 'Reativação com incentivo (12–24 meses)',
    segment: 'inativos_12m',
    channel: 'email',
    premium: false,
    subject: '{nome}, oferecemos-lhe o check-up de regresso',
    body: `Olá {nome},

Já passou mais de um ano desde a sua última visita à {clinica} — e a sua saúde oral merece mais atenção.

Para facilitar o seu regresso, oferecemos-lhe a consulta de avaliação: fazemos o diagnóstico completo e um plano de tratamento sem qualquer custo.

Responda a este email ou ligue-nos para marcar. As vagas desta oferta são limitadas.

Com os melhores cumprimentos,
A equipa da {clinica}

—
Se não desejar receber mais emails da nossa clínica, basta responder com "REMOVER".`,
  },
  {
    id: 'ultima_chamada',
    name: 'Última chamada (24+ meses)',
    segment: 'inativos_24m',
    channel: 'email',
    premium: true,
    subject: '{nome}, a sua ficha na {clinica} vai ser arquivada',
    body: `Olá {nome},

Há mais de dois anos que não o(a) vemos na {clinica} e, por isso, a sua ficha clínica vai passar ao arquivo.

Antes disso, queremos dar-lhe a oportunidade de retomar o acompanhamento: marque uma consulta de reavaliação este mês e mantemos o seu historial e condições de paciente habitual.

Basta responder a este email ou ligar-nos.

Com os melhores cumprimentos,
A equipa da {clinica}

—
Se não desejar receber mais emails da nossa clínica, basta responder com "REMOVER".`,
  },
  {
    id: 'higienizacao',
    name: 'Campanha de higienização / destartarização',
    segment: 'todos_inativos',
    channel: 'email',
    premium: true,
    subject: '{nome}, o seu sorriso merece uma limpeza profissional',
    body: `Olá {nome},

Sabia que a destartarização (limpeza profissional) deve ser feita pelo menos uma vez por ano? É o tratamento com melhor relação custo-benefício para prevenir cáries e doenças gengivais.

Este mês, a {clinica} tem agenda aberta para higienizações. Marque a sua e aproveite para fazer o check-up no mesmo dia.

Responda a este email ou ligue-nos para escolher o seu horário.

Até já,
A equipa da {clinica}

—
Se não desejar receber mais emails da nossa clínica, basta responder com "REMOVER".`,
  },
  {
    id: 'sms_reativacao',
    name: 'SMS de reativação (curto e direto)',
    segment: 'todos_inativos',
    channel: 'sms',
    premium: true,
    subject: null,
    body: `{clinica}: Olá {nome}, já passou da data do seu check-up. Marque a sua consulta esta semana — responda SIM e nós ligamos-lhe. Para não receber SMS, responda REMOVER.`,
  },
];

export function renderTemplate(text, { nome, clinica }) {
  return (text || '')
    .replaceAll('{nome}', nome || 'paciente')
    .replaceAll('{clinica}', clinica || 'a nossa clínica');
}
