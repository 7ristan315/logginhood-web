"use client";

import { useState } from "react";

export default function ChartCard({ title, subtitle, methodology, actions, children, className = "" }) {
  const [showMethod, setShowMethod] = useState(false);

  return (
    <div className={`overflow-hidden ${className}`} style={{ borderRadius: "var(--radius-lg)", background: "var(--surface-1)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
      <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {methodology && (
            <button
              onClick={() => setShowMethod(!showMethod)}
              className="text-xs py-1 px-2.5 rounded-md border cursor-pointer"
              style={{ background: "transparent", borderColor: "var(--border)", color: "var(--text-tertiary)" }}
              aria-expanded={showMethod}
              aria-label="Show methodology"
            >
              {showMethod ? "Hide" : "Method"}
            </button>
          )}
        </div>
      </div>
      {showMethod && methodology && (
        <div className="px-5 py-3 text-xs leading-relaxed" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          {methodology}
        </div>
      )}
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}
