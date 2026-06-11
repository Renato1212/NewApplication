import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { one } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import { apiHandler } from '@/lib/api';

export const POST = apiHandler(async (req) => {
  const { email, password } = await req.json().catch(() => ({}));
  const user = await one('SELECT id, password_hash FROM users WHERE email = $1', [
    (email || '').toLowerCase().trim(),
  ]);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return NextResponse.json({ error: 'Email ou palavra-passe incorretos.' }, { status: 401 });
  }
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
});
