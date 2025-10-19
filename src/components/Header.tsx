'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { useUser } from '@/modules/users/store/user.store'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const debounced = useDebounce(q, 300)
  const user = useUser((s) => s.user)
  const logout = useUser((s) => s.logout)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const currentQ = params.get('q') ?? ''

    if (!params.has('q') && debounced.trim().length === 0) return

    if (debounced.trim() === currentQ.trim()) return

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
    <header className="top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 p-4">
        <Link href={user ? '/books' : "/"} className="text-brand-600 font-semibold italic text-2xl select-none">
          booky
        </Link>

        <form onSubmit={onSubmit} className="hidden max-[1000px]:hidden flex-1">
          <input className="input w-full" placeholder="Search books..." value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <nav className="hidden max-[1000px]:hidden flex items-center gap-3">
          <Link href="/books" className="btn">
            Catalog
          </Link>
          <Link href="/wishlist" className="btn">
            Wishlist
          </Link>
          <Link href="/loans" className="btn">
            My books
          </Link>
          <Link href="/reservations" className="btn">
            Reservations
          </Link>
          {user ? (
            <>
              <span className="text-sm">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn">
              Login
            </Link>
          )}
        </nav>

        <button
          className="p-2 rounded-lg hover:bg-slate-100 hidden max-[1000px]:block"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-200 bg-white/95 backdrop-blur max-[1000px]:block hidden"
          >
            <div className="flex flex-col gap-3 p-4">
              {/* Search visible in mobile */}
              <form onSubmit={onSubmit}>
                <input className="input w-full" placeholder="Search books..." value={q} onChange={(e) => setQ(e.target.value)} />
              </form>

              {/* Navigation */}
              <Link href="/books" className="btn w-full">
                Catalog
              </Link>
              <Link href="/wishlist" className="btn w-full">
                Wishlist
              </Link>
              <Link href="/loans" className="btn w-full">
                My books
              </Link>
              <Link href="/reservations" className="btn w-full">
                Reservations
              </Link>

              {user ? (
                <>
                  <span className="text-sm mt-1">Hi, {user.name.split(' ')[0]}</span>
                  <button className="btn w-full" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn w-full">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
