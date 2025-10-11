import { Book } from '@/modules/books/domain/types'
import BookCard from './BookCard'

export default function BookGrid({ items }: { items: Book[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((b) => (
        <BookCard key={b.id} b={b} />
      ))}
    </div>
  )
}
