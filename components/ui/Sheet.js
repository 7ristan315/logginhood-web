"use client";

import { useEffect, useRef, useCallback } from "react";

export default function Sheet({ open, onClose, title, side = "bottom", children, className = "" }) {
  const sheetRef = useRef(null);
  const prevFocus = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      prevFocus.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const slideClass = side === "right"
    ? "right-0 top-0 h-full w-full max-w-sm"
    : "bottom-0 left-0 right-0 max-h-[85vh]";

  const animName = side === "right" ? "sheet-right" : "sheet-up";

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed ${slideClass} flex flex-col overflow-y-auto overscroll-contain ${className}`}
        style={{
          background: "var(--surface-1)",
          borderRadius: side === "right" ? "var(--radius-xl) 0 0 var(--radius-xl)" : "var(--radius-xl) var(--radius-xl) 0 0",
          animation: `${animName} 0.25s ease`,
        }}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer border-none"
              style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes sheet-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
