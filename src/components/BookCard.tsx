'use client'
import Image from 'next/image'
import { Book } from '@/modules/books/domain/types'
import { useLoans } from '@/modules/loans/store/loan.store'
import { useReservations } from '@/modules/reservations/store/reservation.store'
import { computeAvailability } from '@/modules/books/domain/availability'
import { daysLeft } from '@/lib/date'
import Link from 'next/link'
import { useWishlist } from '@/modules/wishlist/store/wishlist.store'
import { useReading } from '@/modules/reading/store/reading.store'
import { useHydrated } from '@/hooks/useHydrated'

function workIdFromKey(id: string) {
  return id.startsWith('/works/') ? id.replace('/works/', '') : id
}

export default function BookCard({ b }: { b: Book }) {
  const hydrated = useHydrated()

  const hasWish = useWishlist((s) => Boolean(s.items[b.id]));
  const toggleWish = useWishlist((s) => s.toggle)

  const isOnLoan = useLoans((s) => Boolean(s.loans[b.id] && !s.loans[b.id].returnedAt))
  const issue = useLoans((s) => s.issue)
  const renew = useLoans((s) => s.renew)
  const ret = useLoans((s) => s.return)
  const currentLoan = useLoans((s) => s.loans[b.id]);

  const isReserved = useReservations((s) => {
    const r = s.reservations[b.id]
    return !!r && !r.cancelledAt && !r.fulfilledAt
  })
  const reserve = useReservations((s) => s.reserve)

  const setReadingStatus = useReading((s) => s.setStatus)

  const availability = computeAvailability(b.id, isOnLoan)

  const href = `/books/${workIdFromKey(b.id)}`

  function onToggleWishlist() {
    toggleWish({ id: b.id, title: b.title, coverUrl: b.coverUrl })
    if (!hasWish) setReadingStatus(workIdFromKey(b.id), 'WISHLIST', { title: b.title, coverUrl: b.coverUrl })
  }

  return (
    <div className="card p-3">
      <Link href={href} className="block">
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-slate-100">
          {b.coverUrl ? (
            <Image src={b.coverUrl} alt={b.title} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">No cover</div>
          )}
          {availability !== 'AVAILABLE' && (
            <span className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded-full">
              {availability === 'ON_LOAN_MINE' ? `Due in ${daysLeft(currentLoan!.dueAt)}d` : 'On loan'}
            </span>
          )}
        </div>
      </Link>
      <Link href={href}>
        <h3 className="mt-2 font-semibold text-sm line-clamp-2">{b.title}</h3>
      </Link>
      <p className="text-xs text-slate-500 line-clamp-1">{b.authors?.[0] ?? 'Unknown'}</p>
      <div className="mt-2 flex gap-2">
        <button className="btn flex-1" onClick={onToggleWishlist}>
          {hydrated && hasWish ? 'In wishlist' : 'Wishlist'}
        </button>
        {availability === 'AVAILABLE' && (
          <button className="btn-primary flex-1" onClick={() => issue(b)}>
            Borrow
          </button>
        )}

        {availability === 'ON_LOAN_MINE' && (
          <>
            <button className="btn flex-1" onClick={() => renew(b.id)}>
              Renew +7d
            </button>
            <button className="btn flex-1" onClick={() => ret(b.id)}>
              Return
            </button>
          </>
        )}

        {availability === 'ON_LOAN_EXTERNAL' && (
          <button
            className="btn flex-1"
            onClick={() => !isReserved && reserve(b)}
            disabled={isReserved}
            title={isReserved ? 'Already reserved' : 'Reserve'}
          >
            {isReserved ? 'Reserved' : 'Reserve'}
          </button>
        )}
      </div>
    </div>
  )
}
