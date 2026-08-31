import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anmeldung – DRK Hinweisgebersystem',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="flex-1 flex flex-col">
      {children}
    </main>
  );
}
