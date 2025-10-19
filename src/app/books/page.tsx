import Header from '@/components/Header'
import BookGrid from '@/components/BookGrid'
import { searchBooksAdvanced } from '@/modules/books/services/openlibrary'
import { mapOLSearchToBooks } from '@/modules/books/mappers/openlibrary.mapper'
import { sortBooks, type SortKey } from '@/modules/books/domain/sort'
import FilterBar from '@/components/FilterBar'
import Paginator from '@/components/Paginator'
import { Suspense } from 'react'

export const revalidate = 60

type params = { q?: string; author?: string; category?: string; sort?: SortKey; page?: string }

async function resolveSearchParams(input: any) {
  const sp = typeof input?.then === 'function' ? await input : input
  return {
    get(key: string) {
      if (sp && typeof sp.get === 'function') return sp.get(key)
      return sp?.[key]
    },
  }
}

export default async function BooksPage({ searchParams }: { searchParams: params }) {
  const sp = await resolveSearchParams(searchParams)

  const rawQ = (sp.get('q') ?? '').toString()
  const rawAuthor = (sp.get('author') ?? '').toString()
  const rawCategory = (sp.get('category') ?? '').toString()
  const rawSort = (sp.get('sort') ?? 'relevance').toString()
  const rawPage = (sp.get('page') ?? '1').toString()

  const q = rawQ.trim()
  const author = rawAuthor.trim()
  const category = rawCategory.trim()
  const sort = (rawSort as SortKey) || 'relevance'
  const page = Number(rawPage || '1')

  let books = []
  let hasNext = false
  let error = false

  try {
    const json = await searchBooksAdvanced({
      q: q || undefined,
      author: author || undefined,
      category: category || undefined,
      page: page || 1,
    })

    if (!json || !json.docs) throw new Error('Invalid response from API')

    books = sortBooks(mapOLSearchToBooks(json), sort)
    hasNext = (json?.docs?.length ?? 0) > 0 && (json?.numFound ?? 0) > page * 100
  } catch (err) {
    console.error('Failed to load books:', err)
    error = true
  }

  return (
    <main>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <section className="max-w-6xl mx-auto p-4">
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
        <h2 className="text-lg font-semibold mb-3 text-white">
          Results {q && <>for “{q}”</>} {author && <>by {author}</>} {category && <>in {category.replace(/\"/g, '')}</>}
        </h2>
        {error ? (
          <div className="text-center mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Something went wrong</h3>
            <p className="text-sm text-red-600 mt-2">We couldn’t load the books right now. Please try again later.</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center mt-12 text-slate-400">No results found.</div>
        ) : (
          <>
            <BookGrid items={books} />
          </>
        )}
        <Suspense fallback={null}>
          <Paginator hasNext={hasNext} />
        </Suspense>
      </section>
    </main>
  )
}
