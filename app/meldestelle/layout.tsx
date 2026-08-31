import type { Metadata } from 'next';
import MeldestelleHeader from '@/components/meldestelle/MeldestelleHeader';
import MeldestelleFooter from '@/components/meldestelle/MeldestelleFooter';

export const metadata: Metadata = {
  title: 'Meldestelle – DRK Hinweisgebersystem',
  description: 'Interne Meldestelle nach dem Hinweisgeberschutzgesetz (HinSchG) – DRK Kreisverband StädteRegion Aachen e.V.',
};

export default function MeldestelleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--meldestelle-bg-gradient)' }}>
      {/* ── Meldestelle Header ── */}
      <MeldestelleHeader />

      {/* ── Main Content ── */}
      <main id="main-content" className="flex-1 py-6 sm:py-10 px-4">
        {children}
      </main>

      {/* ── Meldestelle Footer ── */}
      <MeldestelleFooter />
    </div>
  );
}
