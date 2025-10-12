import { NextResponse } from 'next/server'

const API = 'https://api.escuelajs.co/api/v1'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!r.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const { access_token, refresh_token } = await r.json()

  const p = await fetch(`${API}/auth/profile`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!p.ok) return NextResponse.json({ error: 'Profile failed' }, { status: 500 })
  const profile = await p.json()

  const res = NextResponse.json({ profile })
  res.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 20 * 24 * 60 * 60, // 20 días
  })
  res.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60 * 60, // 10 horas
  })
  return res
}
