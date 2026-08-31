import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DrkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ── DRK Header ── */}
      <Header />

      {/* ── Main Content ── */}
      <main id="main-content" className="flex-1">{children}</main>

      {/* ── DRK Footer ── */}
      <Footer />
    </>
  );
}
