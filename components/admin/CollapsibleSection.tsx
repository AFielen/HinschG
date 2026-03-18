'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  const updateHeight = useCallback(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  useEffect(() => {
    updateHeight();
  }, [updateHeight]);

  useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setHeight(el.scrollHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left"
        style={{ background: '#3d5a80', color: '#ffffff' }}
      >
        <span>{title}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        style={{
          height: height !== undefined ? `${height}px` : 'auto',
          overflow: 'hidden',
          transition: 'height 200ms ease',
        }}
      >
        <div ref={contentRef} className="p-4" style={{ background: 'var(--bg-card)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
