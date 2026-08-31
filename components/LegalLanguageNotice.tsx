'use client';

import { useLocale, useT } from '@/components/LocaleProvider';

/**
 * Info-Box auf Rechtstext-Seiten (Impressum, Datenschutz): Die Seiten bleiben
 * inhaltlich Deutsch; bei Locale 'en' erscheint dieser Hinweis auf die
 * rechtsverbindliche deutsche Fassung.
 */
export default function LegalLanguageNotice() {
  const { locale } = useLocale();
  const t = useT();

  if (locale !== 'en') return null;

  return (
    <div
      className="rounded-lg p-3 text-sm mb-6 flex items-start gap-2"
      style={{
        background: 'var(--info-bg)',
        color: 'var(--info-text)',
        border: '1px solid var(--info-border)',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 mt-0.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <p>{t('legal.bindingNotice')}</p>
    </div>
  );
}
