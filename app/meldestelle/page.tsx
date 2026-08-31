'use client';

import Link from 'next/link';
import { AccordionItem } from '@/components/meldestelle/Accordion';
import { useT } from '@/components/LocaleProvider';

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--meldestelle-accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--meldestelle-accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function MeldestellePage() {
  const t = useT();

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* ── Section 1: Welcome Card ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: 'var(--meldestelle-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--meldestelle-text)' }}>
          {t('mst.welcomeTitle')}
        </h1>
        <p className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--meldestelle-text-body)' }}>
          {t('mst.welcomeText')}
        </p>
      </div>

      {/* ── Section 2: Report Actions Card ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: 'var(--meldestelle-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <AccordionItem title={<><LockIcon /> {t('mst.confidential.title')}</>} defaultOpen>
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--meldestelle-text-body)' }}>
              {t('mst.confidential.text1')}
            </p>
            <p className="text-[0.85rem]" style={{ color: 'var(--meldestelle-text-muted)' }}>
              {t('mst.confidential.text2')}
            </p>
            <div className="pt-2">
              <Link
                href="/meldestelle/vertraulich"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: 'var(--meldestelle-accent)', minHeight: '44px' }}
              >
                {t('mst.startReport')}
                <ChevronIcon />
              </Link>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title={<><LockIcon /> {t('mst.anonymous.title')}</>}>
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--meldestelle-text-body)' }}>
              {t('mst.anonymous.text1')}
            </p>
            <p className="text-[0.85rem]" style={{ color: 'var(--meldestelle-text-muted)' }}>
              {t('mst.anonymous.text2')}
            </p>
            <div className="pt-2">
              <Link
                href="/meldestelle/anonym"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: 'var(--meldestelle-accent)', minHeight: '44px' }}
              >
                {t('mst.startReport')}
                <ChevronIcon />
              </Link>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title={<><InboxIcon /> {t('mst.postfach.title')}</>}>
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--meldestelle-text-body)' }}>
              {t('mst.postfach.text1')}
            </p>
            <p className="text-[0.85rem]" style={{ color: 'var(--meldestelle-text-muted)' }}>
              {t('mst.postfach.text2')}
            </p>
            <div className="pt-2">
              <Link
                href="/meldestelle/postfach"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: 'var(--meldestelle-accent)', minHeight: '44px' }}
              >
                {t('mst.postfach.button')}
                <ChevronIcon />
              </Link>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.channels.title')} defaultOpen>
          <div className="space-y-3">
            <p className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--meldestelle-text-body)' }}>
              {t('mst.channels.text')}
            </p>
            <div className="space-y-2 pl-1">
              <p className="text-[0.9rem]" style={{ color: 'var(--meldestelle-text-body)' }}>
                <span className="font-semibold">{t('mst.channels.email')}</span>{' '}
                <a
                  href="mailto:meldestelle@drk-aachen.de"
                  className="underline"
                  style={{ color: 'var(--meldestelle-accent-text)' }}
                >
                  meldestelle@drk-aachen.de
                </a>
              </p>
              <p className="text-[0.9rem]" style={{ color: 'var(--meldestelle-text-body)' }}>
                <span className="font-semibold">{t('mst.channels.phone')}</span>{' '}
                <a
                  href="tel:+492419457743"
                  className="underline"
                  style={{ color: 'var(--meldestelle-accent-text)' }}
                >
                  0241 / 94577430
                </a>
              </p>
            </div>
          </div>
        </AccordionItem>
      </div>

      {/* ── Section 3: FAQ Card ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: 'var(--meldestelle-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--meldestelle-text)' }}>
          {t('mst.faqTitle')}
        </h2>

        <AccordionItem title={t('mst.faq1.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq1.p1')}</p>
            <p>{t('mst.faq1.p2')}</p>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.faq2.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq2.p1')}</p>
            <p>{t('mst.faq2.p2')}</p>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.faq3.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq3.p1')}</p>
            <p>
              <span className="font-semibold">{t('mst.faq3.p2.label')}</span>
              {t('mst.faq3.p2.text')}
            </p>
            <p>
              <span className="font-semibold">{t('mst.faq3.p3.label')}</span>
              {t('mst.faq3.p3.text')}
            </p>
            <p>{t('mst.faq3.p4')}</p>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.faq4.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq4.p1')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('mst.faq4.li1')}</li>
              <li>{t('mst.faq4.li2')}</li>
              <li>{t('mst.faq4.li3')}</li>
              <li>{t('mst.faq4.li4')}</li>
              <li>{t('mst.faq4.li5')}</li>
              <li>{t('mst.faq4.li6')}</li>
              <li>{t('mst.faq4.li7')}</li>
              <li>{t('mst.faq4.li8')}</li>
            </ul>
            <p>{t('mst.faq4.p2')}</p>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.faq5.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq5.p1')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('mst.faq5.li1')}</li>
              <li>{t('mst.faq5.li2')}</li>
              <li>{t('mst.faq5.li3')}</li>
              <li>{t('mst.faq5.li4')}</li>
              <li>{t('mst.faq5.li5')}</li>
              <li>{t('mst.faq5.li6')}</li>
              <li>{t('mst.faq5.li7')}</li>
              <li>{t('mst.faq5.li8')}</li>
              <li>{t('mst.faq5.li9')}</li>
              <li>{t('mst.faq5.li10')}</li>
            </ul>
            <p>{t('mst.faq5.p2')}</p>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.faq6.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq6.p1')}</p>
            <p>
              <span className="font-semibold">{t('mst.faq6.p2.label')}</span>
              {t('mst.faq6.p2.text')}
            </p>
            <p>
              <span className="font-semibold">{t('mst.faq6.p3.label')}</span>
              {t('mst.faq6.p3.text')}
            </p>
            <p>{t('mst.faq6.p4')}</p>
          </div>
        </AccordionItem>

        <AccordionItem title={t('mst.faq7.q')}>
          <div className="text-[0.9rem] leading-relaxed space-y-2" style={{ color: 'var(--meldestelle-text-body)' }}>
            <p>{t('mst.faq7.p1')}</p>
            <p>{t('mst.faq7.p2')}</p>
            <p>{t('mst.faq7.p3')}</p>
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
