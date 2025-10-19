import Header from '@/components/Header'
import Image from 'next/image'
import ReadingTracker from '@/components/ReadingTracker'
import { getWork, getAuthorName, normalizeDescription, coverFromIds } from '@/modules/books/services/openlibrary.work'

type PageProps = { params: { id: string } } // id = "OL82563W"

export const revalidate = 300

export default async function BookDetailsPage({ params }: PageProps) {
  const { id: workId } = await params
  const work = await getWork(workId)

  // título, descripción, autores, subjects, año (aprox)
  const title: string = work?.title ?? 'Untitled'
  const description: string | undefined = normalizeDescription(work?.description)
  const subjects: string[] = Array.isArray(work?.subjects) ? work.subjects.slice(0, 12) : []
  const year: number | undefined = work?.first_publish_date ? Number(work.first_publish_date.slice(0, 4)) : work?.first_publish_year

  // autores (nombres)
  const authorKeys: string[] = (work?.authors ?? []).map((a: any) => a?.author?.key).filter(Boolean)
  const authors = await Promise.all(authorKeys.map(getAuthorName))

  const coverUrl = coverFromIds(work?.covers, 'L')

  return (
    <main>
      <Header />
      <section className="max-w-6xl mx-auto p-4">
        <div className="grid md:grid-cols-[240px,1fr] gap-6">
          {/* Portada */}
          <div className="card p-3">
            <div className="relative w-full aspect-[2/3] bg-slate-100 rounded-lg overflow-hidden">
              {coverUrl ? (
                <Image src={coverUrl} alt={title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">No cover</div>
              )}
            </div>
          </div>

          {/* Información principal */}
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-slate-600">
              {authors.filter(Boolean).join(', ') || 'Unknown author'} {year ? `· ${year}` : ''}
            </p>

            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span key={s} className="text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {description && (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{description}</p>
              </div>
            )}

            {/* Rastreador de lectura */}
            <ReadingTracker workId={workId} title={title} coverUrl={coverUrl ?? undefined} />
          </div>
        </div>
      </section>
    </main>
  )
}
