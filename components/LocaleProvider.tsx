'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { t as translate, type Locale, type TranslationKey } from '@/lib/i18n';

const STORAGE_KEY = 'drk-locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'de',
  setLocale: () => undefined,
});

/**
 * Client-Context für die Sprachumschaltung (DE/EN) der öffentlichen Seiten.
 *
 * SSR-sicher: Server und erster Client-Render nutzen immer 'de' (kein
 * Hydration-Mismatch); die gespeicherte Sprache wird erst nach dem Mount
 * aus localStorage gelesen (mounted-Pattern wie in ThemeToggle).
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('de');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'de' || stored === 'en') {
        setLocaleState(stored);
        document.documentElement.lang = stored;
      }
    } catch {
      // localStorage nicht verfügbar → Default 'de'
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistenz optional
    }
    document.documentElement.lang = next;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
  );
}

/** Aktuelle Sprache + Setter */
export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/** Übersetzungsfunktion, gebunden an die aktuelle Sprache */
export function useT(): (key: TranslationKey, params?: Record<string, string | number>) => string {
  const { locale } = useLocale();
  return useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(key, locale, params),
    [locale],
  );
}
