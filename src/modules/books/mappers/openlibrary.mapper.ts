import type { Book } from '../domain/types'
import { coverUrl } from '../services/openlibrary'

export function mapOLSearchToBooks(json: any): Book[] {
  return (json?.docs ?? []).slice(0, 48).map((d: any) => ({
    id: d.key, // e.g. "/works/OL82563W"
    title: d.title ?? 'Untitled',
    authors: d.author_name ?? [],
    year: d.first_publish_year,
    lang: d.language?.[0],
    coverUrl: coverUrl(d.cover_i, 'M'),
  }))
}
