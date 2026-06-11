import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';

// Pequeno parser de CSV com suporte a campos entre aspas.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',' || c === ';') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  return rows;
}

const HEADER_ALIASES = {
  name: ['nome', 'name', 'paciente'],
  email: ['email', 'e-mail', 'correio'],
  phone: ['telefone', 'telemovel', 'telemóvel', 'phone', 'contacto'],
  last_visit: ['ultima_consulta', 'última_consulta', 'ultima consulta', 'data', 'last_visit'],
  last_treatment: ['tratamento', 'ultimo_tratamento', 'último_tratamento', 'treatment'],
};

function mapHeaders(headerRow) {
  const map = {};
  headerRow.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(key)) map[field] = i;
    }
  });
  return map;
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const text = await req.text();
  if (!text?.trim()) return NextResponse.json({ error: 'Ficheiro vazio.' }, { status: 400 });

  const rows = parseCsv(text);
  if (rows.length < 2) {
    return NextResponse.json({ error: 'O ficheiro precisa de um cabeçalho e pelo menos uma linha.' }, { status: 400 });
  }
  const map = mapHeaders(rows[0]);
  if (map.name === undefined) {
    return NextResponse.json(
      { error: 'Não foi encontrada a coluna "nome". Verifique o cabeçalho do CSV.' },
      { status: 400 }
    );
  }

  const plan = planOf(user);
  let count = db.prepare('SELECT COUNT(*) AS n FROM patients WHERE user_id = ?').get(user.id).n;

  const insert = db.prepare(
    'INSERT INTO patients (user_id, name, email, phone, last_visit, last_treatment, consent) VALUES (?, ?, ?, ?, ?, ?, 1)'
  );
  let imported = 0;
  let skipped = 0;
  const tx = db.transaction(() => {
    for (const row of rows.slice(1)) {
      const name = (row[map.name] || '').trim();
      if (!name) { skipped++; continue; }
      if (count >= plan.maxPatients) { skipped++; continue; }
      const get = (f) => (map[f] !== undefined ? (row[map[f]] || '').trim() || null : null);
      insert.run(user.id, name, get('email'), get('phone'), get('last_visit'), get('last_treatment'));
      imported++;
      count++;
    }
  });
  tx();

  const limitNote =
    skipped > 0 && plan.maxPatients !== Infinity && count >= plan.maxPatients
      ? ' Atingiu o limite do plano — passe a Premium para importar todos.'
      : '';
  return NextResponse.json({ imported, skipped, note: limitNote });
}
