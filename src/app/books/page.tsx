import Header from '@/components/Header'
import BookGrid from '@/components/BookGrid'
import { searchBooks } from '@/modules/books/services/openlibrary'
import { mapOLSearchToBooks } from '@/modules/books/mappers/openlibrary.mapper'

export const revalidate = 60

export default async function BooksPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const rawQ = typeof searchParams.q === 'string' ? searchParams.q : '';
  const q = rawQ.trim().length ? rawQ : 'the';
  
  const page = Number(searchParams.page ?? '1')
  const data = await searchBooks({ q, page })
  const books = mapOLSearchToBooks(data)

  return (
    <main>
      <Header />
      <section className="max-w-6xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-3">Results for “{q}”</h2>
        <BookGrid items={books} />
      </section>
    </main>
  )
}
