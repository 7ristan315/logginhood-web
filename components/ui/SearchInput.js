"use client";

import { useState, useEffect, useRef } from "react";

export default function SearchInput({ value, onChange, placeholder = "Search…", debounce = 300, className = "" }) {
  const [local, setLocal] = useState(value || "");
  const timerRef = useRef(null);

  useEffect(() => { setLocal(value || ""); }, [value]);

  function handleChange(e) {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), debounce);
  }

  function handleClear() {
    setLocal("");
    onChange("");
  }

  return (
    <div className={`relative ${className}`}>
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
        style={{ color: "var(--text-tertiary)" }}
        aria-hidden="true"
      >
        ⌕
      </span>
      <input
        type="search"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full py-2 pl-9 pr-8 text-sm rounded-full border"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
        aria-label={placeholder}
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full text-xs cursor-pointer border-none"
          style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
