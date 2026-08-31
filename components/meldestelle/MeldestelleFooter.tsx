'use client';

import Link from 'next/link';
import { useT } from '@/components/LocaleProvider';

export default function MeldestelleFooter() {
  const t = useT();

  return (
    <footer
      className="py-3 px-4 text-center text-[0.75rem]"
      style={{ background: 'var(--meldestelle-footer-bg)', color: 'var(--meldestelle-footer-text)' }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link
          href="/impressum"
          className="hover:underline"
          style={{ color: 'var(--meldestelle-footer-text)' }}
        >
          {t('footer.impressum')}
        </Link>
        <Link
          href="/datenschutz"
          className="hover:underline"
          style={{ color: 'var(--meldestelle-footer-text)' }}
        >
          {t('footer.datenschutz')}
        </Link>
        <span>&copy; {new Date().getFullYear()} - DRK Aachen</span>
      </div>
    </footer>
  );
}
