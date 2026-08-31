'use client';

import Link from 'next/link';
import LocaleToggle from '@/components/LocaleToggle';
import { useT } from '@/components/LocaleProvider';

export default function MeldestelleHeader() {
  const t = useT();

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3"
      style={{ background: 'var(--meldestelle-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <Link href="/meldestelle" className="flex items-center gap-3">
        {/* Shield/Envelope Icon */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: 'var(--meldestelle-accent)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div
            className="text-[1rem] sm:text-[1.15rem] font-bold leading-tight"
            style={{ color: 'var(--meldestelle-text)' }}
          >
            {t('mst.headerTitle')}
          </div>
          <div
            className="text-[0.7rem] sm:text-[0.75rem]"
            style={{ color: 'var(--meldestelle-text-muted)' }}
          >
            {t('mst.headerSubtitle')}
          </div>
        </div>
      </Link>
      <nav className="flex items-center gap-1" style={{ color: 'var(--meldestelle-text-muted)' }}>
        <LocaleToggle />
        {/* Email icon */}
        <Link
          href="mailto:meldestelle@drk-aachen.de"
          title={t('mst.nav.email')}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: 'var(--meldestelle-text-muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </Link>
        {/* Companies icon */}
        <Link
          href="/meldestelle"
          title={t('mst.nav.companies')}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: 'var(--meldestelle-text-muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
          </svg>
        </Link>
        {/* Login icon */}
        <Link
          href="/login"
          title={t('mst.nav.login')}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: 'var(--meldestelle-text-muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" x2="3" y1="12" y2="12" />
          </svg>
        </Link>
        {/* Help icon */}
        <Link
          href="/hilfe"
          title={t('mst.nav.help')}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: 'var(--meldestelle-text-muted)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}
