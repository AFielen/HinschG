'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';

// ── Sidebar Nav Items ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon: ReactNode;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Aufgaben',
    href: '/admin/aufgaben',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Hinweise',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    children: [
      { label: 'Übersicht', href: '/admin/hinweise' },
      { label: 'Hinweis aufgeben', href: '/admin/hinweise/neu' },
    ],
  },
  {
    label: 'Kunden',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    children: [
      { label: 'Übersicht', href: '/admin/kunden' },
      { label: 'Kunden anlegen', href: '/admin/kunden/neu' },
      { label: 'Mitarbeiter Übersicht', href: '/admin/mitarbeiter' },
    ],
  },
  {
    label: 'E-Mail System',
    href: '/admin/email',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'Meldestelle',
    href: '/meldestelle',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

// ── Sidebar Item Component ─────────────────────────────────────────────────

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => pathname.startsWith(c.href));
  });

  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '/')
    : item.children?.some((c) => pathname.startsWith(c.href));

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors"
          style={{
            color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          title={collapsed ? item.label : undefined}
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </button>
        {expanded && !collapsed && (
          <div className="ml-7 mt-1 space-y-0.5">
            {item.children.map((child) => {
              const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    color: childActive ? '#fff' : 'rgba(255,255,255,0.6)',
                    background: childActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const linkTarget = item.href === '/meldestelle' ? '_blank' : undefined;

  return (
    <Link
      href={item.href!}
      target={linkTarget}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors"
      style={{
        color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
      }}
      title={collapsed ? item.label : undefined}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

// ── Admin Shell ────────────────────────────────────────────────────────────

function AdminShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 rounded-full mx-auto mb-3"
            style={{
              borderColor: 'var(--border)',
              borderTopColor: 'var(--drk)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Laden…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Header Bar ── */}
      <header
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{ background: '#2c3e50', color: '#fff' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menü umschalten"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span className="font-bold text-sm tracking-wide hidden sm:inline">
              HINWEIS MELDESTELLE
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs opacity-70 hidden sm:inline">
              {user.displayName || user.username}
            </span>
          )}
          <button
            onClick={logout}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors"
            title="Abmelden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside
          className="shrink-0 flex flex-col overflow-y-auto transition-all duration-200"
          style={{
            width: sidebarOpen ? '220px' : '60px',
            background: '#2c3e50',
          }}
        >
          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <SidebarItem key={item.label} item={item} collapsed={!sidebarOpen} />
            ))}
          </nav>

          {sidebarOpen && (
            <div className="p-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              DRK Hinweisgebersystem
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Layout Export ───────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
