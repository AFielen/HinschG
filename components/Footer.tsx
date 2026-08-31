'use client';

import Link from 'next/link';
import { RedCrossIcon } from '@/components/icons';
import { useT } from '@/components/LocaleProvider';

export default function Footer() {
  const t = useT();

  return (
    <footer
      className="text-center py-10 mt-8 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="text-sm font-bold uppercase tracking-widest mb-2"
        style={{ color: 'var(--drk)' }}
      >
        {t('footer.org')}
      </div>
      <div className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>
        {t('footer.kv')}
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>
        <Link href="/impressum" className="hover:underline" style={{ color: 'inherit' }}>
          {t('footer.impressum')}
        </Link>
        {' · '}
        <Link href="/datenschutz" className="hover:underline" style={{ color: 'inherit' }}>
          {t('footer.datenschutz')}
        </Link>
        {' · '}
        <Link href="/hilfe" className="hover:underline" style={{ color: 'inherit' }}>
          {t('footer.hilfe')}
        </Link>
        {' · '}
        <Link href="/spenden" className="hover:underline" style={{ color: 'inherit' }}>
          {t('footer.spenden')}
        </Link>
      </div>
      <div
        className="text-xs flex items-center justify-center gap-1"
        style={{ color: 'var(--text-light)' }}
      >
        made with{' '}
        <span style={{ color: 'var(--drk)' }}>❤</span>{' '}
        for{' '}
        <RedCrossIcon />
      </div>
    </footer>
  );
}
