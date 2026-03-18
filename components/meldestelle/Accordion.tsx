'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  const updateHeight = useCallback(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  useEffect(() => {
    updateHeight();
  }, [updateHeight]);

  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setHeight(el.scrollHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div className="border-b" style={{ borderColor: '#e5e7eb' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left font-semibold text-[0.95rem] transition-colors"
        style={{ color: '#212529', minHeight: '44px' }}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 ml-2 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#6b7280' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        style={{ height: height !== undefined ? `${height}px` : 'auto', overflow: 'hidden', transition: 'height 250ms ease' }}
      >
        <div ref={contentRef} className="pb-4 px-1">
          {children}
        </div>
      </div>
    </div>
  );
}
