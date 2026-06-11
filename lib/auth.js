import crypto from 'crypto';
import { cookies } from 'next/headers';
import { one } from './db';

const SECRET = process.env.AUTH_SECRET || 'dev-secret-mude-em-producao';
const COOKIE = 'cc_sessao';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function sign(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(userId) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const payload = Buffer.from(data, 'base64url').toString();
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [userId, expiry] = payload.split('.');
  if (Number(expiry) < Date.now()) return null;
  return Number(userId);
}

export async function setSessionCookie(userId) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const userId = verifySessionToken(jar.get(COOKIE)?.value);
  if (!userId) return null;
  try {
    return await one('SELECT id, email, clinic_name, plan, created_at FROM users WHERE id = $1', [userId]);
  } catch (e) {
    console.error('[auth]', e);
    return null;
  }
}
