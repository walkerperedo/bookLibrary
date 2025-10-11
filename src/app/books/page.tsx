import Header from '@/components/Header'
import BookGrid from '@/components/BookGrid'
import { searchBooksAdvanced } from '@/modules/books/services/openlibrary'
import { mapOLSearchToBooks } from '@/modules/books/mappers/openlibrary.mapper'
import { sortBooks, type SortKey } from '@/modules/books/domain/sort'
import FilterBar from '@/components/FilterBar'
import Paginator from '@/components/Paginator'

export const revalidate = 60

type params = { q?: string; author?: string; category?: string; sort?: SortKey; page?: string }

export default async function BooksPage({ searchParams }: { searchParams: params }) {
  const q = (searchParams.q ?? '').trim()
  const author = (searchParams.author ?? '').trim()
  const category = (searchParams.category ?? '').trim()
  const sort = (searchParams.sort as SortKey) ?? 'relevance'
  const page = Number(searchParams.page ?? '1')

  const json = await searchBooksAdvanced({
    q: q || undefined,
    author: author || undefined,
    category: category || undefined,
    page: page || 1,
  })
  const books = sortBooks(mapOLSearchToBooks(json), sort)
  const hasNext = (json?.docs?.length ?? 0) > 0 && (json?.numFound ?? 0) > page * 100

  return (
    <main>
      <Header />
      <section className="max-w-6xl mx-auto p-4">
        <FilterBar />
        <h2 className="text-lg font-semibold mb-3 text-white">
          Results {q && <>for “{q}”</>} {author && <>by {author}</>} {category && <>in {category.replace(/\"/g, '')}</>}
        </h2>
        <BookGrid items={books} />
        <Paginator hasNext={hasNext} />
      </section>
    </main>
  )
}
