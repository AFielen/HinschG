'use client';

import Link from 'next/link';
import { useT } from '@/components/LocaleProvider';

export default function HilfeContent() {
  const t = useT();

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="drk-card">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {t('hilfe.title')}
          </h2>
          <p style={{ color: 'var(--text-light)' }}>{t('hilfe.intro')}</p>
        </div>

        {/* ── FAQ ── */}
        <div className="drk-card">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
            {t('hilfe.faqTitle')}
          </h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="drk-summary">{t('hilfe.faq1.q')}</summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                {t('hilfe.faq1.a1')}
                <Link href="/meldestelle" style={{ color: 'var(--drk)' }} className="hover:underline">
                  {t('hilfe.faq1.link')}
                </Link>
                {t('hilfe.faq1.a2')}
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">{t('hilfe.faq2.q')}</summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                {t('hilfe.faq2.a')}
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">{t('hilfe.faq3.q')}</summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                {t('hilfe.faq3.a1')}
                <Link href="/datenschutz" style={{ color: 'var(--drk)' }} className="hover:underline">
                  {t('hilfe.faq3.link')}
                </Link>
                {t('hilfe.faq3.a2')}
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">{t('hilfe.faq4.q')}</summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                {t('hilfe.faq4.a')}
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">{t('hilfe.faq5.q')}</summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                {t('hilfe.faq5.a')}
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">{t('hilfe.faq6.q')}</summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                {t('hilfe.faq6.a1')}
                <a
                  href="mailto:digitalisierung@drk-aachen.de"
                  style={{ color: 'var(--drk)' }}
                  className="hover:underline"
                >
                  digitalisierung@drk-aachen.de
                </a>
                {t('hilfe.faq6.a2')}
                <Link href="/meldestelle" style={{ color: 'var(--drk)' }} className="hover:underline">
                  {t('hilfe.faq6.link')}
                </Link>
                {t('hilfe.faq6.a3')}
              </p>
            </details>
          </div>
        </div>

        {/* ── Kontakt ── */}
        <div className="drk-card border-l-4" style={{ borderLeftColor: 'var(--drk)' }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            {t('hilfe.contactTitle')}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>
            {t('hilfe.contactText')}
            <br />
            <a
              href="mailto:digitalisierung@drk-aachen.de"
              style={{ color: 'var(--drk)' }}
              className="hover:underline"
            >
              digitalisierung@drk-aachen.de
            </a>
          </p>
        </div>

        <div className="text-center">
          <Link href="/" style={{ color: 'var(--drk)' }} className="hover:underline text-sm font-semibold">
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
