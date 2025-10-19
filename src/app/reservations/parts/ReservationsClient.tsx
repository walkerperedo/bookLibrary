'use client'
import Image from 'next/image'
import { useLoans } from '@/modules/loans/store/loan.store'
import { useUser } from '@/modules/users/store/user.store'
import { useHydrated } from '@/hooks/useHydrated'
import { fmt } from '@/lib/date'
import { useMemo } from 'react'
import { useInventory } from '@/modules/inventory/store/inventory.store'

function workIdFromKey(id: string) {
  return id.startsWith('/works/') ? id.slice('/works/'.length) : id
}
export default function ReservationsClient() {
  const hydrated = useHydrated()

  const userKeyRaw = useUser((s) => (s.user ? `user:${s.user.id}` : 'guest'))
  const userKey = hydrated ? userKeyRaw : 'guest'

  const items = useInventory((s) => s.items)
  const issue = useLoans((s) => s.issue)
  const cancelReservation = useInventory((s) => s.cancelReservation)

  const list = useMemo(() => {
    const now = Date.now()
    return Object.values(items)
      .filter((it) => it.reservation && it.reservation.reservedBy === userKey && new Date(it.reservation.endAt).getTime() > now)
      .map((it) => ({
        id: it.id,
        startAt: it.reservation!.startAt,
        endAt: it.reservation!.endAt,
        coverUrl: it.reservation!.coverUrl,
        title: it.reservation!.title,
        status: it.status,
      }))
  }, [items, userKey])

  if (!hydrated) {
    return <p className="text-slate-500">Loading…</p>
  }

  if (list.length === 0) return <p className="text-slate-500">You have no active reservations.</p>

  function borrowNow(r: any) {
    issue({ id: r.id, title: r.title, coverUrl: r.coverUrl })
  }

  return (
    <ul className="grid md:grid-cols-2 gap-4">
      {list.map((r) => {
        const activeWindow = new Date(r.startAt).getTime() <= Date.now() && Date.now() <= new Date(r.endAt).getTime()
        const canBorrowNow =
          activeWindow && useInventory.getState().canBorrow(r.id, userKey) && useInventory.getState().getItem(r.id)?.status === 'AVAILABLE'

        const href = `/books/${workIdFromKey(r.id)}`
        return (
          <li key={r.id} className="card p-3 flex gap-3">
            <div className="w-20 h-28 relative rounded overflow-hidden bg-slate-100">
              {r.coverUrl && <Image src={r.coverUrl} alt={r.title} fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-slate-600">
                Start: {fmt(r.startAt)} · {`Ends: : ${fmt(r.endAt)}`}
              </p>
              <div className="mt-2 flex gap-2">
                <button className="btn-primary" onClick={() => borrowNow(r.id)} disabled={!canBorrowNow}>
                  Borrow now
                </button>
                <button className="btn" onClick={() => cancelReservation(r.id, userKey)}>
                  Cancel
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
