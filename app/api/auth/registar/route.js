import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req) {
  const { clinic_name, email, password } = await req.json().catch(() => ({}));
  if (!clinic_name?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Preencha todos os campos. A palavra-passe deve ter pelo menos 8 caracteres.' },
      { status: 400 }
    );
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return NextResponse.json({ error: 'Já existe uma conta com este email.' }, { status: 409 });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, clinic_name) VALUES (?, ?, ?)')
    .run(email.toLowerCase().trim(), hash, clinic_name.trim());
  await setSessionCookie(result.lastInsertRowid);
  return NextResponse.json({ ok: true });
}
