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
import { useUser } from '@/modules/users/store/user.store'
import { useInventory } from '@/modules/inventory/store/inventory.store'

function workIdFromKey(id: string) {
  return id.startsWith('/works/') ? id.replace('/works/', '') : id
}

export default function BookCard({ b }: { b: Book }) {
  const hydrated = useHydrated()

  const userKeyRaw = useUser((s) => (s.user ? `user:${s.user.id}` : 'guest'))
  const userKey = hydrated ? userKeyRaw : 'guest'

  const hasWishRaw = useWishlist((s) => Boolean((s.byUser[userKey] ?? {})[b.id]))
  const hasWish = hydrated ? hasWishRaw : false
  const toggleWish = useWishlist((s) => s.toggle)

  const issue = useLoans((s) => s.issue)
  const renew = useLoans((s) => s.renew)
  const ret = useLoans((s) => s.return)

  const resEntry = useReservations((s) => s.byUser[userKey]?.[b.id])
  const isReservedRaw = !!resEntry && !resEntry.cancelledAt && !resEntry.fulfilledAt
  const isReserved = hydrated ? isReservedRaw : false
  const reserve = useReservations((s) => s.reserve)

  const inv = useInventory((s) => s.items[b.id])
  const dueAt = inv?.dueAt || ''

  const availability = hydrated ? computeAvailability(b.id, userKey) : 'AVAILABLE'

  const setReadingStatus = useReading((s) => s.setStatus)
  const href = `/books/${workIdFromKey(b.id)}`

  function onToggleWishlist() {
    toggleWish({ id: b.id, title: b.title, coverUrl: b.coverUrl })
    if (!hasWish) setReadingStatus(workIdFromKey(b.id), 'WISHLIST', { title: b.title, coverUrl: b.coverUrl })
  }

  return (
    <div className="card p-3 flex flex-col">
      <Link href={href} className="block">
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-slate-100">
          {b.coverUrl ? (
            <Image src={b.coverUrl} alt={b.title} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">No cover</div>
          )}
          {hydrated && availability !== 'AVAILABLE' && (
            <span className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded-full">
              {availability === 'ON_LOAN_MINE' && dueAt ? `Due in ${daysLeft(dueAt)}d` : 'On loan'}
            </span>
          )}
        </div>
      </Link>

      <Link href={href}>
        <h3 className="mt-2 font-semibold text-sm line-clamp-2">{b.title}</h3>
      </Link>
      <p className="text-xs text-slate-500 line-clamp-1">{b.authors?.[0] ?? 'Unknown'}</p>

      <div className="flex gap-2 flex-wrap mt-auto">
        <button className="btn flex-1" onClick={onToggleWishlist}>
          <span suppressHydrationWarning>{hydrated && hasWish ? 'In wishlist' : 'Wishlist'}</span>
        </button>

        {hydrated && availability === 'AVAILABLE' && (
          <button className="btn-primary flex-1" onClick={() => issue(b)}>
            Borrow
          </button>
        )}

        {hydrated && availability === 'ON_LOAN_MINE' && (
          <>
            <button className="btn flex-1" onClick={() => renew(b.id)}>
              Renew +7d
            </button>
            <button className="btn flex-1" onClick={() => ret(b.id)}>
              Return
            </button>
          </>
        )}

        {hydrated && availability === 'ON_LOAN_EXTERNAL' && (
          <button className="btn flex-1" onClick={() => !isReserved && reserve(b)} disabled={isReserved}>
            <span suppressHydrationWarning>{isReserved ? 'Reserved' : 'Reserve'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
