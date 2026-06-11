import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { one } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import { apiHandler } from '@/lib/api';

export const POST = apiHandler(async (req) => {
  const { clinic_name, email, password } = await req.json().catch(() => ({}));
  if (!clinic_name?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Preencha todos os campos. A palavra-passe deve ter pelo menos 8 caracteres.' },
      { status: 400 }
    );
  }
  const cleanEmail = email.toLowerCase().trim();
  const existing = await one('SELECT id FROM users WHERE email = $1', [cleanEmail]);
  if (existing) {
    return NextResponse.json({ error: 'Já existe uma conta com este email.' }, { status: 409 });
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = await one(
    'INSERT INTO users (email, password_hash, clinic_name) VALUES ($1, $2, $3) RETURNING id',
    [cleanEmail, hash, clinic_name.trim()]
  );
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
});
