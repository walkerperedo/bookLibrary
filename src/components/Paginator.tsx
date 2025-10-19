'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function Paginator({ hasNext }: { hasNext: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const page = parseInt(params.get('page') ?? '1')
  const [isPending, startTransition] = useTransition()
  const [loadingDir, setLoadingDir] = useState<'next' | 'prev' | null>(null)

  function go(to: number, dir: 'next' | 'prev') {
    const sp = new URLSearchParams(params)
    sp.set('page', String(Math.max(to, 1)))

    setLoadingDir(dir)

    startTransition(() => {
      router.replace(`/books?${sp.toString()}`)
    })
  }

  const isLoading = isPending

  return (
    <div className="flex items-center justify-between mt-4">
      <button className="btn dark" onClick={() => go(page - 1, 'prev')} disabled={page <= 1 || isLoading}>
        {loadingDir === 'prev' && isLoading ? <Spinner /> : 'Previous'}
      </button>
      <div className="text-sm text-slate-600">Page {page}</div>
      <button className="btn dark" onClick={() => go(page + 1, 'next')} disabled={!hasNext || isLoading}>
        {loadingDir === 'next' && isLoading ? <Spinner /> : 'Next'}
      </button>
    </div>
  )
}

function Spinner() {
  return <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" aria-label="Loading..." />
}
