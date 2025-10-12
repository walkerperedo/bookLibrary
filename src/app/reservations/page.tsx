import Header from '@/components/Header';
import ReservationsClient from './parts/ReservationsClient';

export default function ReservationsPage() {
  return (
    <main>
      <Header />
      <section className="max-w-6xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-3">Reservations</h2>
        <ReservationsClient />
      </section>
    </main>
  );
}
