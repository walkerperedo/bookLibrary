// helpers para llamar a nuestra API interna con reintento de refresh
async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const r = await fetch(input, { ...init, credentials: 'include' })
  if (r.status === 401) {
    const rr = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (rr.ok) {
      return fetch(input, { ...init, credentials: 'include' })
    }
  }
  return r
}

export async function loginWithPassword(email: string, password: string) {
  const r = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) throw new Error('Login failed')
  return r.json() as Promise<{ profile: any }>
}

export async function getProfile() {
  const r = await fetchJson('/api/auth/profile', { method: 'GET' })
  if (!r.ok) throw new Error('Profile failed')
  return r.json() as Promise<{ profile: any }>
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}
