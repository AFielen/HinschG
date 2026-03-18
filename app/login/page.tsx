'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Anmeldung fehlgeschlagen');
        return;
      }

      router.push(redirect);
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #4a7a9b 0%, #3d7099 100%)' }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Left: Branding */}
        <div
          className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center text-white"
          style={{ background: 'linear-gradient(135deg, #3d7099 0%, #2c5f7f 100%)' }}
        >
          {/* Shield/Envelope Icon */}
          <div className="mb-6">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 tracking-wide">
            HINWEIS
          </h1>
          <h2 className="text-xl font-bold mb-4 tracking-wide">
            MELDESTELLE
          </h2>
          <div className="w-12 h-0.5 bg-white/40 mb-4" />
          <p className="text-sm opacity-80 leading-relaxed">
            Interne Meldestelle nach dem
            <br />
            Hinweisgeberschutzgesetz (HinSchG)
          </p>
          <div className="mt-8 flex items-center gap-2 opacity-60 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" fill="currentColor" />
            </svg>
            <span>DRK Kreisverband StädteRegion Aachen e.V.</span>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Anmeldung
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-light)' }}>
            Bitte geben Sie Ihre Zugangsdaten ein
          </p>

          {error && (
            <div
              className="mb-6 p-3 rounded-lg text-sm"
              style={{
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
                border: '1px solid var(--error-border)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="drk-label">
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                className="drk-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername eingeben"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="drk-label">
                Kennwort
              </label>
              <input
                id="password"
                type="password"
                className="drk-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kennwort eingeben"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="drk-btn-secondary flex-1"
                onClick={() => router.push('/')}
              >
                Abbruch
              </button>
              <button
                type="submit"
                className="drk-btn-primary flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Anmelden…' : 'Anmelden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
