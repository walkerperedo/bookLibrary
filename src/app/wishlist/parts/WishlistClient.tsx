'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useWishlist } from '@/modules/wishlist/store/wishlist.store'
import { useLoans } from '@/modules/loans/store/loan.store'
import { useReservations } from '@/modules/reservations/store/reservation.store'
import { computeAvailability } from '@/modules/books/domain/availability'
import { ensureNotifyPermission } from '@/lib/notify'
import { useMemo } from 'react'

function workIdFromKey(id: string) {
  return id.startsWith('/works/') ? id.slice('/works/'.length) : id
}

export default function WishlistClient() {
  const itemsMap = useWishlist((s) => s.items)
  const remove = useWishlist((s) => s.remove)

  const issue = useLoans((s) => s.issue)
  const ret = useLoans((s) => s.return)
  const isOnLoan = useLoans((s) => s.isOnLoan)

  const reserve = useReservations((s) => s.reserve)
  const isReservedActive = useReservations((s) => s.isReservedActive)

  const items = useMemo(() => {
    const arr = Object.values(itemsMap);
    arr.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    return arr;
  }, [itemsMap]);

  async function enableNotifications() {
    const perm = await ensureNotifyPermission()
    if (perm !== 'granted') alert('Notifications blocked by the browser.')
  }

  if (items.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-slate-600">Your wishlist is empty.</p>
        <p className="text-sm text-slate-500">
          Find books in the{' '}
          <Link className="underline" href="/books">
            catalog
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Items: {items.length}</p>
        <button className="btn" onClick={enableNotifications}>
          Enable notifications
        </button>
      </div>

      <ul className="grid md:grid-cols-2 gap-4">
        {items.map((it) => {
          const available = computeAvailability(it.id, isOnLoan(it.id))
          const href = `/books/${workIdFromKey(it.id)}`

          return (
            <li key={it.id} className="card p-3 flex gap-3">
              <Link href={href} className="w-20 h-28 relative rounded overflow-hidden bg-slate-100">
                {it.coverUrl && <Image src={it.coverUrl} alt={it.title} fill className="object-cover" />}
              </Link>

              <div className="flex-1">
                <Link href={href}>
                  <h3 className="font-semibold line-clamp-2">{it.title}</h3>
                </Link>
                <p className="text-xs text-slate-500">Added: {new Date(it.addedAt).toLocaleDateString()}</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {available === 'AVAILABLE' && (
                    <button className="btn-primary" onClick={() => issue({ id: it.id, title: it.title, coverUrl: it.coverUrl })}>
                      Borrow
                    </button>
                  )}
                  {available === 'ON_LOAN_MINE' && (
                    <button className="btn" onClick={() => ret(it.id)}>
                      Return
                    </button>
                  )}
                  {available === 'ON_LOAN_EXTERNAL' && (
                    <button
                      className="btn"
                      onClick={() => !isReservedActive(it.id) && reserve({ id: it.id, title: it.title, coverUrl: it.coverUrl })}
                      disabled={isReservedActive(it.id)}
                      title={isReservedActive(it.id) ? 'Already reserved' : 'Reserve'}
                    >
                      {isReservedActive(it.id) ? 'Reserved' : 'Reserve'}
                    </button>
                  )}
                  <button className="btn" onClick={() => remove(it.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
