'use client'
import Image from 'next/image'
import { daysLeft, fmt } from '@/lib/date'
import { useLoans } from '@/modules/loans/store/loan.store'
import { useUser } from '@/modules/users/store/user.store'
import { useHydrated } from '@/hooks/useHydrated'
import { useMemo } from 'react'

export default function LoansClient() {
  const hydrated = useHydrated()

  const userKeyRaw = useUser((s) => (s.user ? `user:${s.user.id}` : 'guest'))
  const userKey = hydrated ? userKeyRaw : 'guest'

  const userLoansMap = useLoans((s) => s.byUser[userKey])

  const list = useMemo(() => {
    const m = userLoansMap ?? {}
    return Object.values(m).filter((l) => !l.returnedAt)
  }, [userLoansMap])

  const renew = useLoans((s) => s.renew)
  const ret = useLoans((s) => s.return)

  if (!hydrated) {
    return <p className="text-slate-500">Loading…</p>
  }

  if (list.length === 0) return <p className="text-slate-500">You have no active loans.</p>

  return (
    <ul className="grid md:grid-cols-2 gap-4">
      {list.map((l) => (
        <li key={l.id} className="card p-3 flex gap-3">
          <div className="w-20 h-28 relative rounded overflow-hidden bg-slate-100">
            {l.coverUrl && <Image src={l.coverUrl} alt={l.title} fill className="object-cover" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{l.title}</h3>
            <p className="text-sm text-slate-600">
              Loaned: {fmt(l.loanedAt)} · Due: {fmt(l.dueAt)} ({daysLeft(l.dueAt)}d)
            </p>
            <div className="mt-2 flex gap-2">
              <button className="btn" onClick={() => renew(l.id)}>
                Renew +7d
              </button>
              <button className="btn" onClick={() => ret(l.id)}>
                Return
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
