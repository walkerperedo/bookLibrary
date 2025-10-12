'use client'
import Image from 'next/image'
import { useReservations } from '@/modules/reservations/store/reservation.store'
import { useLoans } from '@/modules/loans/store/loan.store'
import { fmt } from '@/lib/date'
import { useUser } from '@/modules/users/store/user.store'

export default function ReservationsClient() {
  const userKey = useUser((s) => (s.user ? `user:${s.user.id}` : 'guest'))
  const reservations = useReservations((s) => s.byUser[userKey] ?? {})

  const cancel = useReservations((s) => s.cancel)
  const fulfill = useReservations((s) => s.fulfill)
  const issue = useLoans((s) => s.issue)

  const list = Object.values(reservations).filter((r) => !r.cancelledAt && !r.fulfilledAt)

  if (list.length === 0) return <p className="text-slate-500">You have no active reservations.</p>

  function borrowNow(r: any) {
    issue({ id: r.id, title: r.title, coverUrl: r.coverUrl })
    fulfill(r.id)
  }

  return (
    <ul className="grid md:grid-cols-2 gap-4">
      {list.map((r) => (
        <li key={r.id} className="card p-3 flex gap-3">
          <div className="w-20 h-28 relative rounded overflow-hidden bg-slate-100">
            {r.coverUrl && <Image src={r.coverUrl} alt={r.title} fill className="object-cover" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-slate-600">
              Reserved: {fmt(r.queuedAt)} · {r.readyAt ? `ETA: ${fmt(r.readyAt)}` : 'Waiting...'}
            </p>
            <div className="mt-2 flex gap-2">
              <button className="btn" onClick={() => borrowNow(r)}>
                Borrow now
              </button>
              <button className="btn" onClick={() => cancel(r.id)}>
                Cancel
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
