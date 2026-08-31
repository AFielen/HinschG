'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, HelpIcon } from '@/components/icons';
import ThemeToggle from '@/components/ThemeToggle';
import LocaleToggle from '@/components/LocaleToggle';
import { useT } from '@/components/LocaleProvider';

export default function Header() {
  const t = useT();

  return (
    <header
      className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-4"
      style={{ background: '#e30613', color: '#fff' }}
    >
      <Link href="/" className="flex items-center gap-3 min-w-0" aria-label={t('header.homeAria')}>
        <Image src="/logo.png" alt="DRK Logo" width={42} height={42} priority className="flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-[1.1rem] sm:text-[1.4rem] font-bold leading-tight truncate">
            {t('header.title')}
          </h1>
          <div className="text-[0.8rem] opacity-85 hidden sm:block">{t('header.subtitle')}</div>
          <div className="text-[0.8rem] opacity-85 sm:hidden truncate">{t('header.subtitleShort')}</div>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <LocaleToggle />
        <ThemeToggle />
        <Link
          href="/spenden"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
          title={t('header.donate')}
          aria-label={t('header.donate')}
        >
          <HeartIcon />
        </Link>
        <Link
          href="/hilfe"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
          title={t('header.help')}
          aria-label={t('header.help')}
        >
          <HelpIcon />
        </Link>
      </div>
    </header>
  );
}
