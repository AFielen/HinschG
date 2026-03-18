'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, HelpIcon } from '@/components/icons';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header
      className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-4"
      style={{ background: '#e30613', color: '#fff' }}
    >
      <Link href="/" className="flex items-center gap-3 min-w-0" aria-label="Zur Startseite">
        <Image src="/logo.png" alt="DRK Logo" width={42} height={42} priority className="flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-[1.1rem] sm:text-[1.4rem] font-bold leading-tight truncate">APP_TITEL</h1>
          <div className="text-[0.8rem] opacity-85 hidden sm:block">APP_UNTERTITEL</div>
          <div className="text-[0.8rem] opacity-85 sm:hidden truncate">APP_UNTERTITEL_KURZ</div>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link
          href="/spenden"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
          title="Unterstützen"
          aria-label="Unterstützen"
        >
          <HeartIcon />
        </Link>
        <Link
          href="/hilfe"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
          title="Hilfe"
          aria-label="Hilfe"
        >
          <HelpIcon />
        </Link>
      </div>
    </header>
  );
}
