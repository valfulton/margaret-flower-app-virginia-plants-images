// components/ui/modal.tsx
'use client';

import { useEffect } from 'react';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Tailwind max-width utility, e.g. "max-w-xl" | "max-w-2xl" | "max-w-3xl" */
  maxWidth?: string;
  children: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  maxWidth = 'max-w-2xl', // smaller default so it fits most screens
  children,
}: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent background scroll while open
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel */}
      <div
        className={`relative z-[1001] w-full ${maxWidth} rounded-2xl bg-white shadow-2xl`}
        style={{ maxHeight: '92vh' }} // hard cap so it always fits
      >
        {/* Sticky header with close */}
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-600 hover:bg-gray-100"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-4 py-4 overflow-auto" style={{ maxHeight: 'calc(92vh - 56px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}