"use client";

export default function FilterBar({ filters, values, onChange, className = "" }) {
  function set(key, val) {
    onChange({ ...values, [key]: val });
  }

  function clear() {
    onChange({});
  }

  const hasActive = Object.values(values).some(v => v);

  return (
    <div
      className={`flex items-center gap-2 flex-wrap py-2 ${className}`}
      role="group"
      aria-label="Filters"
    >
      <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: "var(--text-tertiary)" }}>
        Filters
      </span>
      {filters.map(f => (
        <select
          key={f.key}
          value={values[f.key] || ""}
          onChange={e => set(f.key, e.target.value)}
          className="text-sm py-1.5 px-3 rounded-full border cursor-pointer"
          style={{
            background: values[f.key] ? "var(--accent-light)" : "var(--surface-1)",
            borderColor: values[f.key] ? "var(--accent)" : "var(--border)",
            color: values[f.key] ? "var(--accent)" : "var(--text-primary)",
            fontWeight: values[f.key] ? 600 : 400,
          }}
          aria-label={f.label}
        >
          <option value="">{f.label}: All</option>
          {(f.options || []).map(o => (
            <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </select>
      ))}
      {hasActive && (
        <button
          onClick={clear}
          className="text-xs font-semibold py-1.5 px-3 rounded-full border-none cursor-pointer"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
