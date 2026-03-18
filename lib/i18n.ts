export type Locale = 'de' | 'en';

// ── Gemeinsame Übersetzungen (in jeder DRK-App gleich) ──
const shared = {
  de: {
    'nav.impressum': 'Impressum',
    'nav.datenschutz': 'Datenschutz',
    'nav.hilfe': 'Hilfe',
    'nav.language': 'EN',
    'footer.copyright': '© {year} DRK Kreisverband StädteRegion Aachen e.V.',
    'footer.tagline': 'Open Source · Kostenlos · DSGVO-konform · Gebaut mit ❤️ für das Deutsche Rote Kreuz',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.close': 'Schließen',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolgreich',
    'error.notfound': 'Seite nicht gefunden',
    'error.notfound.desc': 'Die angeforderte Seite existiert nicht.',
    'error.notfound.back': 'Zurück zur Startseite',
  },
  en: {
    'nav.impressum': 'Legal Notice',
    'nav.datenschutz': 'Privacy Policy',
    'nav.hilfe': 'Help',
    'nav.language': 'DE',
    'footer.copyright': '© {year} German Red Cross, District Association StädteRegion Aachen',
    'footer.tagline': 'Open Source · Free · GDPR-compliant · Built with ❤️ for the German Red Cross',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'error.notfound': 'Page not found',
    'error.notfound.desc': 'The requested page does not exist.',
    'error.notfound.back': 'Back to home',
  },
} as const;

// ── App-spezifische Übersetzungen (hier pro App erweitern) ──
const appTranslations = {
  de: {
    'app.title': 'APP_TITEL',
    'app.subtitle': 'APP_UNTERTITEL',
    'app.description': 'APP_BESCHREIBUNG',
    // Hier app-spezifische Keys ergänzen
  },
  en: {
    'app.title': 'APP_TITLE_EN',
    'app.subtitle': 'APP_SUBTITLE_EN',
    'app.description': 'APP_DESCRIPTION_EN',
    // Add app-specific keys here
  },
} as const;

// ── Zusammengeführte Übersetzungen ──
type TranslationKey = keyof typeof shared['de'] | keyof typeof appTranslations['de'];

const translations: Record<Locale, Record<string, string>> = {
  de: { ...shared.de, ...appTranslations.de },
  en: { ...shared.en, ...appTranslations.en },
};

/**
 * Übersetzungsfunktion
 * @param key - Übersetzungsschlüssel
 * @param locale - Sprache (default: 'de')
 * @param params - Platzhalter-Werte, z.B. { year: '2026' }
 */
export function t(
  key: TranslationKey | string,
  locale: Locale = 'de',
  params?: Record<string, string>
): string {
  let text = translations[locale]?.[key] || translations['de']?.[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

/**
 * Alle Keys einer Kategorie holen (z.B. alle 'app.*' Keys)
 */
export function tGroup(prefix: string, locale: Locale = 'de'): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(translations[locale])) {
    if (key.startsWith(prefix)) {
      result[key] = value;
    }
  }
  return result;
}
