"use client";

import { useEffect, useRef, useCallback } from "react";

export default function Dialog({ open, onClose, title, description, children, size = "md", className = "" }) {
  const dialogRef = useRef(null);
  const prevFocus = useRef(null);

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-5xl" };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") { onClose?.(); return; }
    if (e.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      setTimeout(() => {
        const first = dialogRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        first?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      prevFocus.current?.focus();
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={description ? "dialog-desc" : undefined}
        className={`relative w-full ${sizes[size]} rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--shadow-xl)] flex flex-col max-h-[85vh] ${className}`}
        style={{ animation: "dialog-in 0.2s ease" }}
      >
        {title && (
          <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p id="dialog-desc" className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--surface-3)] transition-colors"
              aria-label="Close dialog"
              style={{ color: "var(--text-tertiary)" }}
            >
              <span className="text-lg leading-none">✕</span>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 pb-5">
          {children}
        </div>
      </div>
      <style>{`@keyframes dialog-in { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 mt-2 border-t ${className}`} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}
