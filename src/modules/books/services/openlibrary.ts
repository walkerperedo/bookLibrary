const OL = 'https://openlibrary.org'

export async function searchBooks(params: { q: string; page?: number }) {
  const { q, page = 1 } = params
  const url = `${OL}/search.json?q=${encodeURIComponent(q)}&page=${page}`
  const res = await fetch(url, { next: { revalidate: 60 } }) // RSC cache/ISR
  if (!res.ok) throw new Error('OpenLibrary search failed')
  return res.json()
}

export function coverUrl(cover_i?: number, size: 'S' | 'M' | 'L' = 'M') {
  return cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-${size}.jpg` : undefined
}
