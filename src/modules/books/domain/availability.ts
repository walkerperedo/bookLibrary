import { useInventory } from "@/modules/inventory/store/inventory.store";

export type Availability = 'AVAILABLE' | 'ON_LOAN_MINE' | 'ON_LOAN_EXTERNAL';


export function computeAvailability(bookId: string, currentUserKey: string): Availability {
  const inv = useInventory.getState().items[bookId];
  if (!inv || inv.status === 'AVAILABLE') return 'AVAILABLE';
  return inv.loanedBy === currentUserKey ? 'ON_LOAN_MINE' : 'ON_LOAN_EXTERNAL';
}

export function getDueAt(bookId: string): string | undefined {
  return useInventory.getState().items[bookId]?.dueAt;
}