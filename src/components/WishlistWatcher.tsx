'use client'

import { useEffect, useRef } from 'react'
import { useLoans } from '@/modules/loans/store/loan.store'
import { computeAvailability, type Availability } from '@/modules/books/domain/availability'
import { ensureNotifyPermission, notify } from '@/lib/notify'
import { useWishlist } from '@/modules/wishlist/store/wishlist.store'
import { getUserKey } from '@/lib/userKey'

const KEY = 'wishlist:availability:v1'

type AvMap = Record<string, Availability>

function loadPrev(): AvMap {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AvMap) : {}
  } catch {
    return {}
  }
}
function savePrev(map: AvMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export default function WishlistWatcher() {
  const wishlist = useWishlist((s) => s.items)
  const isOnLoan = useLoans((s) => s.isOnLoan)
  const prevRef = useRef<AvMap>({})

  useEffect(() => {
    prevRef.current = loadPrev()
  }, [])

  useEffect(() => {

    async function check() {
      if (Object.keys(wishlist).length > 0) {
        await ensureNotifyPermission()
      }

      const nextMap: AvMap = { ...prevRef.current }
      for (const it of Object.values(wishlist)) {
        const curr = computeAvailability(it.id, getUserKey())
        const prev = prevRef.current[it.id]

        if (prev === 'ON_LOAN_EXTERNAL' && curr === 'AVAILABLE') {
          notify('Book available', {
            body: it.title,
            icon: it.coverUrl,
          })
        }
        nextMap[it.id] = curr
      }
      for (const id of Object.keys(prevRef.current)) {
        if (!wishlist[id]) delete nextMap[id]
      }
      prevRef.current = nextMap
      savePrev(nextMap)
    }

    check()

    const timer = setInterval(check, 60_000)

    function onVis() {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [wishlist, isOnLoan])

  return null
}
