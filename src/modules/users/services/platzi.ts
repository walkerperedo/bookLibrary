export type PlatziUser = { id: number; email: string; name: string; avatar: string }
const BASE = process.env.NEXT_PUBLIC_PLATZI_USERS ?? 'https://api.escuelajs.co/api/v1/users'

export async function listUsers(): Promise<PlatziUser[]> {
  const res = await fetch(BASE, { cache: 'no-store' })
  if (!res.ok) throw new Error('Platzi users failed')
  return res.json()
}
