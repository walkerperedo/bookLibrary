'use client'

import { useState } from 'react'
import { listUsers } from '@/modules/users/services/platzi'
import { useUser } from '@/modules/users/store/user.store'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useUser((s) => s.login)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const users = await listUsers()
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase())
      if (!found) setError('User not found. Try any email/name from Platzi Fake API.')
      else {
        login(found)
        router.push('/books')
      }
    } catch (err: any) {
      setError('Login failed. ' + (err?.message ?? ''))
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
            <label className="block text-sm mb-1">Email or Name</label>
            <input className="input" placeholder="e.g. john@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
          <p className="text-xs text-slate-500 text-center">Demo login against Platzi Users API.</p>
        </form>
      </div>
    </main>
  )
}
