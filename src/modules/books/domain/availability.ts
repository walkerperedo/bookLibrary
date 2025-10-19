import { useInventory } from '@/modules/inventory/store/inventory.store'

export type Availability = 'AVAILABLE' | 'ON_LOAN_MINE' | 'ON_LOAN_EXTERNAL'

export function computeAvailability(bookId: string, currentUserKey: string): Availability {
  const item = useInventory.getState().getItem(bookId)
  if (!item || item.status === 'AVAILABLE') return 'AVAILABLE'
  return item.loanedBy === currentUserKey ? 'ON_LOAN_MINE' : 'ON_LOAN_EXTERNAL'
}

export function getDueAt(bookId: string): string | undefined {
  return useInventory.getState().items[bookId]?.dueAt
}
