'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { PlusIcon } from '@/components/admin/ButtonBar';
import { useAuth } from '@/lib/auth/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────

interface UserRow {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  role: 'admin' | 'user';
  active: boolean;
  createdAt: string;
}

const MIN_PASSWORD_LENGTH = 12;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // Response ohne JSON-Body
  }
  return fallback;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BenutzerPage() {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'admin';

  // Benutzerliste
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Neuer Benutzer
  const [showCreate, setShowCreate] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<'admin' | 'user'>('user');
  const [createPassword, setCreatePassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Passwort zurücksetzen
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Eigenes Passwort ändern
  const [ownCurrent, setOwnCurrent] = useState('');
  const [ownNew, setOwnNew] = useState('');
  const [ownRepeat, setOwnRepeat] = useState('');
  const [ownError, setOwnError] = useState<string | null>(null);
  const [ownSuccess, setOwnSuccess] = useState<string | null>(null);
  const [ownSubmitting, setOwnSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(Array.isArray(json.data) ? json.data : []);
      } else {
        setListError(
          await readErrorMessage(res, 'Benutzer konnten nicht geladen werden.'),
        );
      }
    } catch {
      setListError('Benutzer konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchUsers]);

  // ── Aktionen ─────────────────────────────────────────────────────────────

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setActionSuccess(null);

    if (!createUsername.trim()) {
      setCreateError('Bitte einen Benutzernamen angeben.');
      return;
    }
    if (!createDisplayName.trim()) {
      setCreateError('Bitte einen Anzeigenamen angeben.');
      return;
    }
    if (createPassword.length < MIN_PASSWORD_LENGTH) {
      setCreateError(
        `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`,
      );
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createUsername.trim(),
          displayName: createDisplayName.trim(),
          email: createEmail.trim() || undefined,
          role: createRole,
          password: createPassword,
        }),
      });

      if (res.status === 409) {
        setCreateError('Dieser Benutzername ist bereits vergeben.');
        return;
      }
      if (!res.ok) {
        setCreateError(
          await readErrorMessage(res, 'Benutzer konnte nicht angelegt werden.'),
        );
        return;
      }

      setActionSuccess(`Benutzer „${createUsername.trim()}“ wurde angelegt.`);
      setShowCreate(false);
      setCreateUsername('');
      setCreateDisplayName('');
      setCreateEmail('');
      setCreateRole('user');
      setCreatePassword('');
      fetchUsers();
    } catch {
      setCreateError('Benutzer konnte nicht angelegt werden.');
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleToggleActive(row: UserRow) {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !row.active }),
      });
      if (!res.ok) {
        setActionError(
          await readErrorMessage(res, 'Benutzer konnte nicht geändert werden.'),
        );
        return;
      }
      setActionSuccess(
        row.active
          ? `Benutzer „${row.username}“ wurde deaktiviert.`
          : `Benutzer „${row.username}“ wurde aktiviert.`,
      );
      fetchUsers();
    } catch {
      setActionError('Benutzer konnte nicht geändert werden.');
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);
    setActionSuccess(null);

    if (resetPassword.length < MIN_PASSWORD_LENGTH) {
      setResetError(
        `Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`,
      );
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPassword }),
      });
      if (!res.ok) {
        setResetError(
          await readErrorMessage(
            res,
            'Passwort konnte nicht zurückgesetzt werden.',
          ),
        );
        return;
      }
      setActionSuccess(
        `Passwort für „${resetTarget.username}“ wurde zurückgesetzt.`,
      );
      setResetTarget(null);
      setResetPassword('');
    } catch {
      setResetError('Passwort konnte nicht zurückgesetzt werden.');
    } finally {
      setResetSubmitting(false);
    }
  }

  async function handleOwnPassword(e: FormEvent) {
    e.preventDefault();
    setOwnError(null);
    setOwnSuccess(null);

    if (ownNew.length < MIN_PASSWORD_LENGTH) {
      setOwnError(
        `Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`,
      );
      return;
    }
    if (ownNew !== ownRepeat) {
      setOwnError('Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    setOwnSubmitting(true);
    try {
      const res = await fetch('/api/admin/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: ownCurrent,
          newPassword: ownNew,
        }),
      });
      if (res.status === 401) {
        setOwnError('Das aktuelle Passwort ist falsch.');
        return;
      }
      if (!res.ok) {
        setOwnError(
          await readErrorMessage(res, 'Passwort konnte nicht geändert werden.'),
        );
        return;
      }
      setOwnSuccess('Ihr Passwort wurde erfolgreich geändert.');
      setOwnCurrent('');
      setOwnNew('');
      setOwnRepeat('');
    } catch {
      setOwnError('Passwort konnte nicht geändert werden.');
    } finally {
      setOwnSubmitting(false);
    }
  }

  // ── Tabellen-Spalten ─────────────────────────────────────────────────────

  const columns = [
    {
      key: 'username',
      label: 'Benutzername',
      render: (row: UserRow) => (
        <span className="font-medium" style={{ color: 'var(--text)' }}>
          {row.username}
          {row.id === authUser?.id && (
            <span className="ml-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              (Sie)
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'displayName',
      label: 'Anzeigename',
      render: (row: UserRow) => row.displayName ?? '—',
    },
    {
      key: 'email',
      label: 'E-Mail',
      render: (row: UserRow) => row.email ?? '—',
    },
    {
      key: 'role',
      label: 'Rolle',
      render: (row: UserRow) => (
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
          style={
            row.role === 'admin'
              ? { background: '#fee2e2', color: '#991b1b' }
              : { background: '#e5e7eb', color: '#374151' }
          }
        >
          {row.role === 'admin' ? 'Administrator' : 'Benutzer'}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (row: UserRow) => (
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
          style={
            row.active
              ? { background: '#d1fae5', color: '#065f46' }
              : { background: '#f3f4f6', color: '#6b7280' }
          }
        >
          {row.active ? 'Aktiv' : 'Deaktiviert'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Erstellt',
      render: (row: UserRow) => (row.createdAt ? formatDate(row.createdAt) : '—'),
    },
    {
      key: '_actions',
      label: '',
      sortable: false,
      width: '260px',
      render: (row: UserRow) => {
        const isSelf = row.id === authUser?.id;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setResetError(null);
                setResetPassword('');
                setResetTarget(row);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-90"
              style={{ background: '#3d5a80', color: '#fff' }}
            >
              Passwort zurücksetzen
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleActive(row);
              }}
              disabled={isSelf && row.active}
              title={
                isSelf && row.active
                  ? 'Der eigene Account kann nicht deaktiviert werden.'
                  : undefined
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                row.active
                  ? { background: '#dc2626', color: '#fff' }
                  : { background: 'var(--success)', color: '#fff' }
              }
            >
              {row.active ? 'Deaktivieren' : 'Aktivieren'}
            </button>
          </div>
        );
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: '#3d5a80' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="4" />
              <path d="M2 21v-2a4 4 0 0 1 4-4h6" />
              <circle cx="19" cy="16" r="3" />
              <path d="M19 11.5v1" />
              <path d="M19 19.5v1" />
              <path d="M22.9 13.75l-.87.5" />
              <path d="M15.97 17.75l-.87.5" />
              <path d="M22.9 18.25l-.87-.5" />
              <path d="M15.97 14.25l-.87-.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Benutzerverwaltung
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Benutzerkonten anlegen, deaktivieren und Passwörter verwalten.
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors self-start"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              minHeight: '44px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Aktualisieren
          </button>
        )}
      </div>

      {/* Meldungen */}
      {actionSuccess && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: '#d1fae5', color: '#065f46' }}
        >
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--drk-bg)', color: 'var(--drk-dark)' }}
        >
          {actionError}
        </div>
      )}

      {!isAdmin ? (
        <div className="drk-card">
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>
            Nur für Administratoren. Sie können unten Ihr eigenes Passwort
            ändern.
          </p>
        </div>
      ) : (
        <>
          {/* Benutzerliste */}
          <div className="drk-card space-y-3">
            <ButtonBar
              buttons={[
                {
                  label: 'Neuer Benutzer',
                  icon: <PlusIcon />,
                  onClick: () => {
                    setCreateError(null);
                    setShowCreate(!showCreate);
                  },
                },
              ]}
            />

            {/* Formular: Neuer Benutzer */}
            {showCreate && (
              <form
                onSubmit={handleCreate}
                className="rounded-lg p-4 space-y-3"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  Neuen Benutzer anlegen
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="create-username" className="drk-label">
                      Benutzername *
                    </label>
                    <input
                      id="create-username"
                      type="text"
                      className="drk-input"
                      value={createUsername}
                      onChange={(e) => setCreateUsername(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="create-displayname" className="drk-label">
                      Anzeigename *
                    </label>
                    <input
                      id="create-displayname"
                      type="text"
                      className="drk-input"
                      value={createDisplayName}
                      onChange={(e) => setCreateDisplayName(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="create-email" className="drk-label">
                      E-Mail
                    </label>
                    <input
                      id="create-email"
                      type="email"
                      className="drk-input"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="create-role" className="drk-label">
                      Rolle *
                    </label>
                    <select
                      id="create-role"
                      className="drk-input"
                      value={createRole}
                      onChange={(e) =>
                        setCreateRole(e.target.value === 'admin' ? 'admin' : 'user')
                      }
                    >
                      <option value="user">Benutzer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="create-password" className="drk-label">
                      Passwort * (mindestens {MIN_PASSWORD_LENGTH} Zeichen)
                    </label>
                    <input
                      id="create-password"
                      type="password"
                      className="drk-input"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                {createError && (
                  <p className="text-sm" style={{ color: 'var(--drk)' }}>
                    {createError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="drk-btn-primary"
                    disabled={createSubmitting}
                  >
                    {createSubmitting ? 'Wird angelegt…' : 'Benutzer anlegen'}
                  </button>
                  <button
                    type="button"
                    className="drk-btn-secondary"
                    onClick={() => {
                      setShowCreate(false);
                      setCreateError(null);
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}

            {/* Formular: Passwort zurücksetzen */}
            {resetTarget && (
              <form
                onSubmit={handleResetPassword}
                className="rounded-lg p-4 space-y-3"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  Passwort zurücksetzen für „{resetTarget.username}“
                </h2>
                <div>
                  <label htmlFor="reset-password" className="drk-label">
                    Neues Passwort * (mindestens {MIN_PASSWORD_LENGTH} Zeichen)
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    className="drk-input"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    autoFocus
                    required
                  />
                </div>
                {resetError && (
                  <p className="text-sm" style={{ color: 'var(--drk)' }}>
                    {resetError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="drk-btn-primary"
                    disabled={resetSubmitting}
                  >
                    {resetSubmitting ? 'Wird gespeichert…' : 'Passwort setzen'}
                  </button>
                  <button
                    type="button"
                    className="drk-btn-secondary"
                    onClick={() => {
                      setResetTarget(null);
                      setResetPassword('');
                      setResetError(null);
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}

            {listError && (
              <p className="text-sm" style={{ color: 'var(--drk)' }}>
                {listError}
              </p>
            )}

            <DataTable
              columns={columns}
              data={users}
              loading={loading}
              emptyMessage="Keine Benutzer vorhanden."
            />
          </div>
        </>
      )}

      {/* Eigenes Passwort ändern – für jeden eingeloggten Benutzer */}
      <div className="drk-card">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
          Eigenes Passwort ändern
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-light)' }}>
          Das neue Passwort muss mindestens {MIN_PASSWORD_LENGTH} Zeichen lang
          sein.
        </p>
        <form onSubmit={handleOwnPassword} className="space-y-3 max-w-md">
          <div>
            <label htmlFor="own-current" className="drk-label">
              Aktuelles Passwort *
            </label>
            <input
              id="own-current"
              type="password"
              className="drk-input"
              value={ownCurrent}
              onChange={(e) => setOwnCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label htmlFor="own-new" className="drk-label">
              Neues Passwort *
            </label>
            <input
              id="own-new"
              type="password"
              className="drk-input"
              value={ownNew}
              onChange={(e) => setOwnNew(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label htmlFor="own-repeat" className="drk-label">
              Neues Passwort wiederholen *
            </label>
            <input
              id="own-repeat"
              type="password"
              className="drk-input"
              value={ownRepeat}
              onChange={(e) => setOwnRepeat(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              required
            />
          </div>
          {ownError && (
            <p className="text-sm" style={{ color: 'var(--drk)' }}>
              {ownError}
            </p>
          )}
          {ownSuccess && (
            <p className="text-sm" style={{ color: 'var(--success)' }}>
              {ownSuccess}
            </p>
          )}
          <button type="submit" className="drk-btn-primary" disabled={ownSubmitting}>
            {ownSubmitting ? 'Wird gespeichert…' : 'Passwort ändern'}
          </button>
        </form>
      </div>
    </div>
  );
}
