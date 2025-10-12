import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API = 'https://api.escuelajs.co/api/v1';

export async function POST() {
  const refresh = (await cookies()).get('refresh_token')?.value;
  if (!refresh) return NextResponse.json({ error: 'Missing refresh' }, { status: 401 });

  const r = await fetch(`${API}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  if (!r.ok) return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });

  const { access_token, refresh_token } = await r.json();

  const res = NextResponse.json({ ok: true });
  res.cookies.set('access_token', access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 20 * 24 * 60 * 60,
  });
  res.cookies.set('refresh_token', refresh_token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 10 * 60 * 60,
  });
  return res;
}
