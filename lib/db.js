import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

function createDb() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, 'cadeiracheia.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      clinic_name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'gratis',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      last_visit TEXT,
      last_treatment TEXT,
      consent INTEGER NOT NULL DEFAULT 1,
      opted_out INTEGER NOT NULL DEFAULT 0,
      recovered_at TEXT,
      recovered_value REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      segment TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'email',
      subject TEXT,
      body TEXT NOT NULL,
      sent_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
    CREATE TABLE IF NOT EXISTS campaign_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
      patient_id INTEGER NOT NULL REFERENCES patients(id),
      status TEXT NOT NULL DEFAULT 'pendente',
      recovered_value REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON campaign_recipients(campaign_id);
  `);
  return db;
}

const db = globalThis.__cadeiracheia_db ?? createDb();
globalThis.__cadeiracheia_db = db;

export default db;
