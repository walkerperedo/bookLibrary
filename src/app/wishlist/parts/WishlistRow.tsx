'use client'

import { useInventory } from '@/modules/inventory/store/inventory.store'
import { useLoans } from '@/modules/loans/store/loan.store'
import { useReservations } from '@/modules/reservations/store/reservation.store'
import { useWishlist } from '@/modules/wishlist/store/wishlist.store'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  it: {
    id: string
    title: string
    coverUrl?: string
    addedAt: string
  }
  userKey: string
}

export default function WishlistRow({ it, userKey }: Props) {
  const invItem = useInventory((s) => s.items[it.id])

  const availability =
    !invItem || invItem.status === 'AVAILABLE' ? 'AVAILABLE' : invItem.loanedBy === userKey ? 'ON_LOAN_MINE' : 'ON_LOAN_EXTERNAL'

  const resEntry = useReservations((s) => s.byUser[userKey]?.[it.id])
  const isReserved = !!resEntry && !resEntry.cancelledAt && !resEntry.fulfilledAt

  // actions
  const issue = useLoans((s) => s.issue)
  const ret = useLoans((s) => s.return)
  const reserve = useReservations((s) => s.reserve)
  const remove = useWishlist((s) => s.remove)

  function onBorrow() {
    issue({ id: it.id, title: it.title, coverUrl: it.coverUrl })
    // UI updates automatically because invItem selector above re-runs
  }
  function onReturn() {
    ret(it.id)
  }
  function onReserve() {
    if (!isReserved) reserve({ id: it.id, title: it.title, coverUrl: it.coverUrl })
  }

  const href = `/books/${it.id.startsWith('/works/') ? it.id.slice('/works/'.length) : it.id}`
  return (
    <li className="card p-3 flex gap-3">
      <Link href={href} className="w-20 h-28 relative rounded overflow-hidden bg-slate-100">
        {it.coverUrl && <Image src={it.coverUrl} alt={it.title} fill className="object-cover" />}
      </Link>

      <div className="flex-1">
        <Link href={href}>
          <h3 className="font-semibold line-clamp-2">{it.title}</h3>
        </Link>
        <p className="text-xs text-slate-500">Added: {new Date(it.addedAt).toLocaleDateString()}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {availability === 'AVAILABLE' && (
            <button className="btn-primary" onClick={onBorrow}>
              Borrow
            </button>
          )}
          {availability === 'ON_LOAN_MINE' && (
            <button className="btn" onClick={onReturn}>
              Return
            </button>
          )}
          {availability === 'ON_LOAN_EXTERNAL' && (
            <button className="btn" onClick={onReserve} disabled={isReserved}>
              {isReserved ? 'Reserved' : 'Reserve'}
            </button>
          )}
          <button className="btn" onClick={() => remove(it.id)}>
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
