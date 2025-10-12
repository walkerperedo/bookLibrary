import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API = 'https://api.escuelajs.co/api/v1';

export async function GET() {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ error: 'No session' }, { status: 401 });

  const r = await fetch(`${API}/auth/profile`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });

  if (r.status === 401) return NextResponse.json({ error: 'Expired' }, { status: 401 });

  if (!r.ok) return NextResponse.json({ error: 'Profile failed' }, { status: 500 });

  const profile = await r.json();
  return NextResponse.json({ profile });
}
