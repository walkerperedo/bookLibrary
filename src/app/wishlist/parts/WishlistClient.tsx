'use client'

import Link from 'next/link'
import { useWishlist } from '@/modules/wishlist/store/wishlist.store'
import { ensureNotifyPermission } from '@/lib/notify'
import { useMemo } from 'react'
import { useUser } from '@/modules/users/store/user.store'
import { useHydrated } from '@/hooks/useHydrated'
import WishlistRow from './WishlistRow'

function workIdFromKey(id: string) {
  return id.startsWith('/works/') ? id.slice('/works/'.length) : id
}

export default function WishlistClient() {
  const hydrated = useHydrated()

  const userKeyRaw = useUser((s) => (s.user ? `user:${s.user.id}` : 'guest'))
  const userKey = hydrated ? userKeyRaw : 'guest'
  const itemsMap = useWishlist((s) => s.byUser[userKey])

  const items = useMemo(() => {
    const m = itemsMap ?? {}
    return Object.values(m).sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  }, [itemsMap])

  async function enableNotifications() {
    const perm = await ensureNotifyPermission()
    if (perm !== 'granted') alert('Notifications blocked by the browser.')
  }

  if (!hydrated) {
    return <div className="card p-6 text-slate-600">Loading…</div>
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
        <button className="btn dark" onClick={enableNotifications}>
          Enable notifications
        </button>
      </div>

      <ul className="grid md:grid-cols-2 gap-4">
        {items.map((it) => (
          <WishlistRow key={it.id} it={it} userKey={userKey} />
        ))}
      </ul>
    </div>
  )
}
