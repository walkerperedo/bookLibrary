import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('access_token', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  res.cookies.set('refresh_token', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
