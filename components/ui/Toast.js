"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ── State management ──────────────────────────────────────────────────────────

let _nextId = 0;

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      // Keep at most 3 toasts; drop the oldest if needed
      const toasts = state.length >= 3 ? state.slice(1) : state;
      return [...toasts, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ── Icons ─────────────────────────────────────────────────────────────────────

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="4.5" r="0.75" fill="currentColor" />
    </svg>
  ),
};

const VARIANT_STYLES = {
  success: {
    background: "var(--toast-success-bg, #f0fdf4)",
    color: "var(--toast-success-fg, #166534)",
    borderColor: "var(--toast-success-border, #bbf7d0)",
  },
  error: {
    background: "var(--toast-error-bg, #fef2f2)",
    color: "var(--toast-error-fg, #991b1b)",
    borderColor: "var(--toast-error-border, #fecaca)",
  },
  info: {
    background: "var(--toast-info-bg, #eff6ff)",
    color: "var(--toast-info-fg, #1e40af)",
    borderColor: "var(--toast-info-border, #bfdbfe)",
  },
};

// ── Single toast item ─────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 4000);

    return () => clearTimeout(timerRef.current);
  }, [toast.id, toast.duration, onRemove]);

  const variant = toast.variant ?? "info";
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      style={{
        ...styles,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 10,
        border: `1px solid ${styles.borderColor}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: 14,
        lineHeight: 1.4,
        minWidth: 260,
        maxWidth: 380,
        pointerEvents: "auto",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[variant]}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        aria-label="Dismiss"
        style={{
          all: "unset",
          cursor: "pointer",
          flexShrink: 0,
          opacity: 0.5,
          fontSize: 16,
          lineHeight: 1,
          marginTop: -1,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Portal container ──────────────────────────────────────────────────────────

function ToastPortal({ toasts, dispatch }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const remove = useCallback(
    (id) => dispatch({ type: "REMOVE", id }),
    [dispatch]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>,
    document.body
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const toast = useCallback(({ message, variant = "info", duration = 4000 }) => {
    dispatch({
      type: "ADD",
      toast: { id: ++_nextId, message, variant, duration },
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastPortal toasts={toasts} dispatch={dispatch} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

export default ToastProvider;
