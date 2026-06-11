import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  const user = db
    .prepare('SELECT id, password_hash FROM users WHERE email = ?')
    .get((email || '').toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return NextResponse.json({ error: 'Email ou palavra-passe incorretos.' }, { status: 401 });
  }
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
