import { Pool } from 'pg';

// Camada de dados em Postgres. Em produção (Vercel), crie uma base de dados
// Neon no separador Storage do projeto — a variável DATABASE_URL/POSTGRES_URL
// é injetada automaticamente.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

function createPool() {
  if (!connectionString) {
    throw new Error(
      'Base de dados não configurada: defina DATABASE_URL (Postgres). Na Vercel, crie uma base de dados Neon no separador Storage do projeto.'
    );
  }
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  return new Pool({
    connectionString,
    max: 5,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

function getPool() {
  if (!globalThis.__cc_pool) globalThis.__cc_pool = createPool();
  return globalThis.__cc_pool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    clinic_name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'gratis',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    last_visit TEXT,
    last_treatment TEXT,
    consent INTEGER NOT NULL DEFAULT 1,
    opted_out INTEGER NOT NULL DEFAULT 0,
    recovered_at TIMESTAMPTZ,
    recovered_value REAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
  CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    segment TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    subject TEXT,
    body TEXT NOT NULL,
    sent_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
  CREATE TABLE IF NOT EXISTS campaign_recipients (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    status TEXT NOT NULL DEFAULT 'pendente',
    recovered_value REAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON campaign_recipients(campaign_id);
`;

async function ensureSchema() {
  if (!globalThis.__cc_schema_ready) {
    globalThis.__cc_schema_ready = getPool().query(SCHEMA);
  }
  await globalThis.__cc_schema_ready;
}

/** Devolve todas as linhas. */
export async function q(sql, params = []) {
  await ensureSchema();
  const { rows } = await getPool().query(sql, params);
  return rows;
}

/** Devolve a primeira linha ou null. */
export async function one(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] ?? null;
}

/** Executa um comando sem resultado relevante. */
export async function run(sql, params = []) {
  await ensureSchema();
  return getPool().query(sql, params);
}

/** Executa várias operações numa transação. */
export async function tx(fn) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** Formata uma data (Date ou string) como AAAA-MM-DD. */
export function fmtDate(d) {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date) ? null : date.toISOString().slice(0, 10);
}
