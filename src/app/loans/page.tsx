import Header from '@/components/Header';
import LoansClient from './parts/LoansClient';

export default function LoansPage() {
  return (
    <main>
      <Header />
      <section className="max-w-6xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-3">My loans</h2>
        <LoansClient />
      </section>
    </main>
  );
}
