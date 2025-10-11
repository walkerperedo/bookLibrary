'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { useUser } from '@/modules/users/store/user.store'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const debounced = useDebounce(q, 300)
  const user = useUser((s) => s.user)

  useEffect(() => {
    const currentQ = params.get('q') ?? '';

    if (!params.has('q') && debounced.trim().length === 0) return;

    if (debounced.trim() === currentQ.trim()) return;
    
    const sp = new URLSearchParams(params)

    if (debounced.trim().length === 0) {
      sp.delete('q')
    } else {
      sp.set('q', debounced.trim())
    }

    sp.set('page', '1')
    router.replace(`/books?${sp.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const sp = new URLSearchParams(params)
    sp.set('q', q)
    sp.set('page', '1')
    router.replace(`/books?${sp.toString()}`)
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center gap-4 p-3">
        <Link href="/" className="text-brand-600 font-semibold italic text-xl">
          booky
        </Link>
        <form onSubmit={onSubmit} className="flex-1">
          <input className="input" placeholder="Search books..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <nav className="flex items-center gap-3">
          <Link href="/books" className="btn">
            Catalog
          </Link>
          <Link href="/wishlist" className="btn">
            Wishlist
          </Link>
          <Link href="/loans" className="btn">
            My books
          </Link>
          {user ? (
            <span className="text-sm">Hi, {user.name.split(' ')[0]}</span>
          ) : (
            <Link href="/login" className="btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
