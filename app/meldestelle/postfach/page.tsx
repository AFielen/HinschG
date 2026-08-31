'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Nachricht {
  id: number;
  richtung: 'AnHinweisgeber' | 'VonHinweisgeber';
  inhalt: string;
  createdAt: string;
}

interface Anhang {
  id: number;
  dateiname: string;
  groesse: number;
  createdAt: string;
}

interface PostfachDaten {
  aktenzeichen: string;
  status: 'Neu' | 'InBearbeitung' | 'Abgeschlossen';
  createdAt: string;
  eingangsbestaetigungAm: string | null;
  rueckmeldungFaelligAm: string | null;
  rueckmeldungAm: string | null;
  nachrichten: Nachricht[];
  anhaenge: Anhang[];
}

// Client-seitige Upload-Grenzen (Server prüft zusätzlich, siehe lib/anhaenge.ts)
const MAX_ANHANG_BYTES = 10 * 1024 * 1024;
const ERLAUBTE_DATEITYPEN = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ANHANG_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.txt,.docx,.xlsx';

const STATUS_LABEL: Record<PostfachDaten['status'], string> = {
  Neu: 'Neu',
  InBearbeitung: 'In Bearbeitung',
  Abgeschlossen: 'Abgeschlossen',
};

const STATUS_FARBEN: Record<
  PostfachDaten['status'],
  { background: string; color: string }
> = {
  Neu: { background: '#eff6ff', color: '#1e40af' },
  InBearbeitung: { background: '#fef3c7', color: '#92400e' },
  Abgeschlossen: { background: '#d1fae5', color: '#065f46' },
};

function formatDatum(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatGroesse(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toLocaleString('de-DE', {
      maximumFractionDigits: 1,
    })} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
}

function formatDatumZeit(iso: string): string {
  return (
    new Date(iso).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' Uhr'
  );
}

export default function PostfachPage() {
  const [laden, setLaden] = useState(true);
  const [daten, setDaten] = useState<PostfachDaten | null>(null);

  // Login-Formular
  const [aktenzeichen, setAktenzeichen] = useState('');
  const [zugangscode, setZugangscode] = useState('');
  const [anmelden, setAnmelden] = useState(false);
  const [loginFehler, setLoginFehler] = useState('');

  // Antwort-Formular
  const [antwort, setAntwort] = useState('');
  const [senden, setSenden] = useState(false);
  const [sendeFehler, setSendeFehler] = useState('');

  // Anhang-Upload
  const dateiInputRef = useRef<HTMLInputElement>(null);
  const [datei, setDatei] = useState<File | null>(null);
  const [hochladen, setHochladen] = useState(false);
  const [uploadFehler, setUploadFehler] = useState('');

  const ladePostfach = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/public/postfach');
      if (!res.ok) {
        setDaten(null);
        return false;
      }
      const body = (await res.json()) as PostfachDaten;
      setDaten(body);
      return true;
    } catch {
      setDaten(null);
      return false;
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await ladePostfach();
      setLaden(false);
    })();
  }, [ladePostfach]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAnmelden(true);
    setLoginFehler('');
    try {
      const res = await fetch('/api/public/postfach/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktenzeichen, zugangscode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setLoginFehler(
          body?.error ||
            (res.status === 429
              ? 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.'
              : 'Aktenzeichen oder Zugangscode ist falsch.'),
        );
        return;
      }
      await ladePostfach();
      setZugangscode('');
    } catch {
      setLoginFehler('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setAnmelden(false);
    }
  }

  async function handleSenden() {
    if (!antwort.trim()) return;
    setSenden(true);
    setSendeFehler('');
    try {
      const res = await fetch('/api/public/postfach/nachricht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inhalt: antwort.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 401) {
          // Sitzung abgelaufen → zurück zur Anmeldung
          setDaten(null);
          setLoginFehler('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
          return;
        }
        throw new Error(body?.error || 'Fehler beim Senden der Nachricht');
      }
      setAntwort('');
      await ladePostfach();
    } catch (err) {
      setSendeFehler(
        err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
      );
    } finally {
      setSenden(false);
    }
  }

  function handleDateiAuswahl(e: React.ChangeEvent<HTMLInputElement>) {
    const gewaehlt = e.target.files?.[0] ?? null;
    setUploadFehler('');
    if (gewaehlt) {
      if (gewaehlt.size > MAX_ANHANG_BYTES) {
        setUploadFehler('Die Datei ist zu groß (maximal 10 MB).');
        setDatei(null);
        e.target.value = '';
        return;
      }
      if (!ERLAUBTE_DATEITYPEN.includes(gewaehlt.type)) {
        setUploadFehler(
          'Dieser Dateityp ist nicht erlaubt. Erlaubt sind PDF, JPG, PNG, WebP, TXT, DOCX und XLSX.',
        );
        setDatei(null);
        e.target.value = '';
        return;
      }
    }
    setDatei(gewaehlt);
  }

  async function handleHochladen() {
    if (!datei) return;
    setHochladen(true);
    setUploadFehler('');
    try {
      const formData = new FormData();
      formData.append('datei', datei);
      const res = await fetch('/api/public/postfach/anhang', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 401) {
          // Sitzung abgelaufen → zurück zur Anmeldung
          setDaten(null);
          setLoginFehler('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
          return;
        }
        throw new Error(body?.error || 'Fehler beim Hochladen der Datei');
      }
      setDatei(null);
      if (dateiInputRef.current) dateiInputRef.current.value = '';
      await ladePostfach();
    } catch (err) {
      setUploadFehler(
        err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten',
      );
    } finally {
      setHochladen(false);
    }
  }

  async function handleAbmelden() {
    try {
      await fetch('/api/public/postfach/logout', { method: 'POST' });
    } finally {
      setDaten(null);
      setAktenzeichen('');
      setZugangscode('');
      setLoginFehler('');
      setSendeFehler('');
      setAntwort('');
      setDatei(null);
      setUploadFehler('');
    }
  }

  if (laden) {
    return (
      <div className="max-w-[800px] mx-auto">
        <div
          className="rounded-xl p-6 sm:p-8 text-center"
          style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        >
          <p className="text-[0.9rem]" style={{ color: '#6b7280' }}>
            Postfach wird geladen...
          </p>
        </div>
      </div>
    );
  }

  // ── Zustand (a): Login ──
  if (!daten) {
    return (
      <div className="max-w-[600px] mx-auto space-y-6">
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{ background: '#4a7a9b' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#212529' }}>
              Postfach — Status Ihrer Meldung
            </h1>
          </div>
          <p className="text-[0.9rem] leading-relaxed mb-6" style={{ color: '#4a5568' }}>
            Melden Sie sich mit Ihrem Aktenzeichen und Ihrem Zugangscode an, um den
            Bearbeitungsstand Ihrer Meldung einzusehen, Nachrichten der Meldestelle zu
            lesen und Rückfragen zu beantworten — auch bei anonymen Meldungen.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="drk-label" htmlFor="aktenzeichen">
                Aktenzeichen *
              </label>
              <input
                id="aktenzeichen"
                type="text"
                className="drk-input font-mono"
                value={aktenzeichen}
                onChange={(e) => setAktenzeichen(e.target.value)}
                placeholder="z.B. 2026-08-31-ABCD2345"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label className="drk-label" htmlFor="zugangscode">
                Zugangscode *
              </label>
              <input
                id="zugangscode"
                type="password"
                className="drk-input font-mono"
                value={zugangscode}
                onChange={(e) => setZugangscode(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                autoComplete="off"
                required
              />
            </div>

            {loginFehler && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }}
              >
                {loginFehler}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link href="/meldestelle" className="drk-btn-secondary flex items-center gap-2">
                Zurück
              </Link>
              <button
                type="submit"
                disabled={anmelden || !aktenzeichen.trim() || !zugangscode.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#4a7a9b', minHeight: '44px' }}
              >
                {anmelden ? 'Wird geprüft...' : 'Anmelden'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div
          className="rounded-lg p-4 flex items-start gap-3"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Aktenzeichen und Zugangscode wurden Ihnen einmalig nach dem Absenden Ihrer
            Meldung angezeigt. Sie können aus Sicherheitsgründen nicht wiederhergestellt
            werden.
          </p>
        </div>
      </div>
    );
  }

  // ── Zustand (b): Eingeloggt ──
  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* ── Status-Karte ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#212529' }}>
              Ihre Meldung
            </h1>
            <p className="text-[0.95rem] font-bold font-mono mt-1" style={{ color: '#4a7a9b' }}>
              {daten.aktenzeichen}
            </p>
          </div>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
            style={STATUS_FARBEN[daten.status]}
          >
            {STATUS_LABEL[daten.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>
              Eingang
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#212529' }}>
              {formatDatum(daten.createdAt)}
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>
              Eingangsbestätigung
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#212529' }}>
              {formatDatum(daten.eingangsbestaetigungAm)}
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>
              {daten.rueckmeldungAm ? 'Rückmeldung erfolgt' : 'Rückmeldung bis'}
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#212529' }}>
              {formatDatum(daten.rueckmeldungAm ?? daten.rueckmeldungFaelligAm)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Nachrichten-Thread ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: '#212529' }}>
          Nachrichten
        </h2>

        <div className="space-y-4">
          {daten.nachrichten.length === 0 && (
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Noch keine Nachrichten vorhanden.
            </p>
          )}
          {daten.nachrichten.map((nachricht) => {
            const vonMeldestelle = nachricht.richtung === 'AnHinweisgeber';
            return (
              <div
                key={nachricht.id}
                className={`flex ${vonMeldestelle ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className="max-w-[85%] rounded-lg p-4"
                  style={
                    vonMeldestelle
                      ? { background: '#f1f5f9', border: '1px solid #e2e8f0' }
                      : { background: '#4a7a9b' }
                  }
                >
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: vonMeldestelle ? '#4a7a9b' : 'rgba(255,255,255,0.8)' }}
                  >
                    {vonMeldestelle ? 'Meldestelle' : 'Sie'}
                  </p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: vonMeldestelle ? '#212529' : '#ffffff' }}
                  >
                    {nachricht.inhalt}
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{ color: vonMeldestelle ? '#9ca3af' : 'rgba(255,255,255,0.7)' }}
                  >
                    {formatDatumZeit(nachricht.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Antwort ── */}
        <div className="pt-6 mt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
          <label className="drk-label" htmlFor="antwort">
            Ihre Nachricht an die Meldestelle
          </label>
          <textarea
            id="antwort"
            className="drk-input"
            rows={4}
            maxLength={10000}
            value={antwort}
            onChange={(e) => setAntwort(e.target.value)}
            placeholder="Rückfrage beantworten, Informationen ergänzen oder Unterlagen beschreiben..."
          />
          <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
            Belege und Unterlagen können Sie im Abschnitt „Anhänge“ unterhalb des
            Nachrichtenverlaufs als Datei nachreichen.
          </p>

          {sendeFehler && (
            <div
              className="rounded-lg p-3 text-sm mt-3"
              style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }}
            >
              {sendeFehler}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={handleAbmelden}
              className="drk-btn-secondary flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Abmelden
            </button>
            <button
              type="button"
              onClick={handleSenden}
              disabled={senden || !antwort.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4a7a9b', minHeight: '44px' }}
            >
              {senden ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Wird gesendet...
                </>
              ) : (
                <>
                  Senden
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Anhänge ── */}
      <div
        className="rounded-xl p-6 sm:p-8"
        style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: '#212529' }}>
          Anhänge
        </h2>

        {daten.anhaenge.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Noch keine Anhänge vorhanden.
          </p>
        ) : (
          <ul className="space-y-2">
            {daten.anhaenge.map((anhang) => (
              <li
                key={anhang.id}
                className="rounded-lg p-3 flex flex-wrap items-center justify-between gap-3"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-all" style={{ color: '#212529' }}>
                    {anhang.dateiname}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    {formatGroesse(anhang.groesse)} · {formatDatum(anhang.createdAt)}
                  </p>
                </div>
                <a
                  href={`/api/public/postfach/anhang/${anhang.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold underline shrink-0"
                  style={{ color: '#4a7a9b' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  Herunterladen
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* ── Upload ── */}
        <div className="pt-6 mt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
          <label className="drk-label" htmlFor="anhang-datei">
            Datei nachreichen
          </label>
          <input
            id="anhang-datei"
            ref={dateiInputRef}
            type="file"
            className="drk-input"
            accept={ANHANG_ACCEPT}
            onChange={handleDateiAuswahl}
            disabled={hochladen}
          />
          <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
            Erlaubte Formate: PDF, JPG, PNG, WebP, TXT, DOCX, XLSX — maximal 10 MB
            pro Datei.
          </p>

          {uploadFehler && (
            <div
              className="rounded-lg p-3 text-sm mt-3"
              style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }}
            >
              {uploadFehler}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleHochladen}
              disabled={hochladen || !datei}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4a7a9b', minHeight: '44px' }}
            >
              {hochladen ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Wird hochgeladen...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  Anhang hochladen
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
