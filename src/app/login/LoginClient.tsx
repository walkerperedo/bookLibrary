'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/modules/users/store/user.store'

export default function LoginClient() {
  const [email, setEmail] = useState('john@mail.com')
  const [password, setPassword] = useState('changeme')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useSearchParams()
  const login = useUser((s) => s.loginCreds)
  const user = useUser((s) => s.user)
  const hydrate = useUser((s) => s.hydrateFromSession)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (user) {
      const returnTo = params.get('returnTo') ?? '/books'
      router.replace(returnTo)
    }
  }, [user, router, params])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold italic text-brand-600">booky</h1>
        </div>
        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input" placeholder="e.g. john@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
          <p className="text-xs text-slate-500 text-center">Demo john@mail.com / changeme.</p>
        </form>
      </div>
    </main>
  )
}
