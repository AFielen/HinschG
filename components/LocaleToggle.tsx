'use client';

import { useLocale, useT } from '@/components/LocaleProvider';

/**
 * Schlichter DE | EN-Umschalter. Erbt die Textfarbe des umgebenden Headers
 * (currentColor), aktive Sprache fett — Stil passend zu ThemeToggle.
 */
export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'de' ? 'en' : 'de')}
      className="flex items-center justify-center h-9 px-2 rounded-full hover:bg-white/10 transition-colors text-[0.8rem] leading-none"
      aria-label={t('header.languageAria')}
      title={t('header.languageTitle')}
    >
      <span className={locale === 'de' ? 'font-bold' : 'font-normal opacity-70'}>DE</span>
      <span className="opacity-50 mx-1" aria-hidden="true">
        |
      </span>
      <span className={locale === 'en' ? 'font-bold' : 'font-normal opacity-70'}>EN</span>
    </button>
  );
}
