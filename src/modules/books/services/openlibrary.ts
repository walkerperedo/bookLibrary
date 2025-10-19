const OL = 'https://openlibrary.org'

function buildQuery({ q, author, category }: { q?: string; author?: string; category?: string }) {
  const tokens: string[] = []
  if (q && q.trim().length) tokens.push(q.trim())
  if (author && author.trim().length) tokens.push(`author:${JSON.stringify(author.trim())}`)
  if (category && category.trim().length) tokens.push(`subject:${category}`) // category ya viene con quotes si las necesita
  return tokens.join(' ')
}

export async function searchBooksAdvanced(params: { q?: string; author?: string; category?: string; page?: number }) {
  const { q, author, category, page = 1 } = params
  const query = buildQuery({ q, author, category })
  const url = `${OL}/search.json?q=${encodeURIComponent(query || 'the')}&page=${page}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  
  if (!res.ok) throw new Error('OpenLibrary search failed')
  return res.json()
}

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
