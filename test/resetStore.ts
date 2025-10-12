// test/resetStores.ts
import { act } from '@testing-library/react';
import { useWishlist } from '@/modules/wishlist/store/wishlist.store';
import { useLoans } from '@/modules/loans/store/loan.store';
import { useReservations } from '@/modules/reservations/store/reservation.store';
import { useReading } from '@/modules/reading/store/reading.store';
import { useInventory } from '@/modules/inventory/store/inventory.store';
import { useUser } from '@/modules/users/store/user.store';

export function resetAllStores() {
  localStorage.clear();

  act(() => {
    try { useWishlist.setState({ byUser: {} } as any); } catch {}
    try { useLoans.setState({ byUser: {} } as any); } catch {}
    try { useReservations.setState({ byUser: {} } as any); } catch {}
    try { useReading.setState({ byUser: {} } as any); } catch {}
    try { useInventory.setState({ items: {} } as any); } catch {}
    try { useUser.setState({ user: null } as any); } catch {}
  });

}
