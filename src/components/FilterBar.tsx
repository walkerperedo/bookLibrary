'use client'

import { CATEGORIES } from '@/modules/books/domain/categories'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()

  const [author, setAuthor] = useState(params.get('author') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [sort, setSort] = useState(params.get('sort') ?? 'relevance')

  useEffect(() => {
    setAuthor(params.get('author') ?? '')
    setCategory(params.get('category') ?? '')
    setSort(params.get('sort') ?? 'relevance')
  }, [params])

  function update(param: string, value?: string) {
    const sp = new URLSearchParams(params)
    if (value && value.trim().length) sp.set(param, value)
    else sp.delete(param)
    sp.set('page', '1')
    router.push(`/books?${sp.toString()}`)
  }

  return (
    <div className="card p-3 mb-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="filter-author" className="block text-xs mb-1">
            Author
          </label>
          <input
            id="filter-author"
            className="input"
            placeholder="e.g. J.K. Rowling"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onBlur={() => update('author', author)}
            onKeyDown={(e) => e.key === 'Enter' && update('author', author)}
          />
        </div>

        <div>
          <label htmlFor="filter-category" className="block text-xs mb-1">
            Category
          </label>
          <select
            id="filter-category"
            className="input"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              update('category', e.target.value)
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.label} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="block text-xs mb-1">
            Sort by
          </label>
          <select
            id="filter-sort"
            className="input"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              update('sort', e.target.value)
            }}
          >
            <option value="relevance">Relevance (API)</option>
            <option value="date_desc">Publication date ↓</option>
            <option value="date_asc">Publication date ↑</option>
            <option value="author_asc">Author A–Z</option>
            <option value="author_desc">Author Z–A</option>
            <option value="popularity_desc">Popularity</option>
          </select>
        </div>
      </div>
    </div>
  )
}
