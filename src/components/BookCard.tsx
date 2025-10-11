'use client'
import Image from 'next/image'
import { Book } from '@/modules/books/domain/types'

export default function BookCard({ b }: { b: Book }) {
  return (
    <div className="card p-3">
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-slate-100">
        {b.coverUrl ? (
          <Image src={b.coverUrl} alt={b.title} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">No cover</div>
        )}
      </div>
      <h3 className="mt-2 font-semibold text-sm line-clamp-2">{b.title}</h3>
      <p className="text-xs text-slate-500 line-clamp-1">{b.authors?.[0] ?? 'Unknown'}</p>
    </div>
  )
}
