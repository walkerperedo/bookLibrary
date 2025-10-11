import { Book } from './types'

export type SortKey = 'relevance' | 'date_desc' | 'date_asc' | 'author_asc' | 'author_desc' | 'popularity_desc'

export function sortBooks(books: Book[], sort: SortKey): Book[] {
  const arr = [...books]
  switch (sort) {
    case 'date_desc':
      arr.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      break
    case 'date_asc':
      arr.sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
      break
    case 'author_asc':
      arr.sort((a, b) => (a.authors?.[0] ?? '').localeCompare(b.authors?.[0] ?? ''))
      break
    case 'author_desc':
      arr.sort((a, b) => (b.authors?.[0] ?? '').localeCompare(a.authors?.[0] ?? ''))
      break
    case 'popularity_desc':
      arr.sort((a, b) => (b.editions ?? 0) - (a.editions ?? 0))
      break
    case 'relevance':
    default:
      break
  }
  return arr
}
