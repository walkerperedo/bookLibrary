export function fmt(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString()
}
export function daysLeft(dueAt: string) {
  const diff = new Date(dueAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
