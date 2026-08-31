'use client';

import Link from 'next/link';
import { useT } from '@/components/LocaleProvider';

export default function SpendenContent() {
  const t = useT();

  return (
    <div className="py-8 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Danke Box ── */}
        <div className="drk-card drk-fade-in text-center">
          <div className="text-5xl mb-4" aria-hidden="true">❤️</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            {t('spenden.thanksTitle')}
          </h2>
          <p style={{ color: 'var(--text-light)' }}>{t('spenden.thanksText')}</p>
        </div>

        {/* ── Über das DRK ── */}
        <div className="drk-card drk-slide-up">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
            {t('spenden.aboutTitle')}
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-light)' }}>
            {t('spenden.aboutText1')}
          </p>
          <p style={{ color: 'var(--text-light)' }}>{t('spenden.aboutText2')}</p>
        </div>

        {/* ── Spenden-Optionen ── */}
        <div className="drk-card">
          <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>
            {t('spenden.optionsTitle')}
          </h3>

          <div className="space-y-5">
            {/* Online-Spende */}
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: 'var(--drk-bg)' }}
              >
                <span className="text-lg" aria-hidden="true">🌐</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  {t('spenden.online')}
                </p>
                <a
                  href="https://www.drk-aachen.de/spenden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: 'var(--drk)' }}
                >
                  www.drk-aachen.de/spenden →
                </a>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Bankverbindung */}
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: 'var(--drk-bg)' }}
              >
                <span className="text-lg" aria-hidden="true">🏦</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  {t('spenden.bank')}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                  {t('spenden.bankOrg')}
                </p>
                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  {t('spenden.bankInfo')}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Mitglied werden */}
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: 'var(--drk-bg)' }}
              >
                <span className="text-lg" aria-hidden="true">🙋</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  {t('spenden.member')}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                  {t('spenden.memberText')}
                </p>
                <a
                  href="https://www.drk-aachen.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: 'var(--drk)' }}
                >
                  {t('spenden.memberMore')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Open Source ── */}
        <div className="drk-card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="flex gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">💻</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {t('spenden.osTitle')}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                {t('spenden.osText')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pb-4">
          <Link
            href="/"
            className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--drk)' }}
          >
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
