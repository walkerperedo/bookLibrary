'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function Paginator({ hasNext }: { hasNext: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const page = parseInt(params.get('page') ?? '1')

  function go(to: number) {
    const sp = new URLSearchParams(params)
    sp.set('page', String(Math.max(to, 1)))
    router.replace(`/books?${sp.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <button className="btn dark" onClick={() => go(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <div className="text-sm text-slate-600">Page {page}</div>
      <button className="btn dark" onClick={() => go(page + 1)} disabled={!hasNext}>
        Next
      </button>
    </div>
  )
}
