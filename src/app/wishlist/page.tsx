import Header from '@/components/Header'
import WishlistClient from './parts/WishlistClient'
import { Suspense } from 'react'

export default function WishlistPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <section className="max-w-6xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-3">Wishlist</h2>
        <WishlistClient />
      </section>
    </main>
  )
}
