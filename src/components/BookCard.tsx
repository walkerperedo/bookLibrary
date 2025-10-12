'use client'
import Image from 'next/image'
import { Book } from '@/modules/books/domain/types'
import { useLoans } from '@/modules/loans/store/loan.store'
import { useReservations } from '@/modules/reservations/store/reservation.store'
import { computeAvailability } from '@/modules/books/domain/availability'
import { daysLeft } from '@/lib/date'

export default function BookCard({ b }: { b: Book }) {
  const issue = useLoans((s) => s.issue)
  const renew = useLoans((s) => s.renew)
  const ret = useLoans((s) => s.return)
  const isOnLoan = useLoans((s) => s.isOnLoan)(b.id)

  const reserve = useReservations((s) => s.reserve)
  const isReserved = useReservations((s) => s.isReservedActive)(b.id)

  const availability = computeAvailability(b.id, isOnLoan)
  const currentLoan = useLoans((s) => s.loans[b.id])
  return (
    <div className="card p-3">
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
      <h3 className="mt-2 font-semibold text-sm line-clamp-2">{b.title}</h3>
      <p className="text-xs text-slate-500 line-clamp-1">{b.authors?.[0] ?? 'Unknown'}</p>
      <div className="mt-2 flex gap-2">
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
