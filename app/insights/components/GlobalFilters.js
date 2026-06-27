"use client";

export default function GlobalFilters({ filters, onChange, data }) {
  function set(key, val) {
    onChange({ ...filters, [key]: val });
  }

  function clear() {
    onChange({});
  }

  const opts = (key) => [...new Set((data || []).map(r => r[key]).filter(Boolean))].sort();
  const hasActive = Object.values(filters).some(v => v);

  return (
    <div className="flex items-center gap-2 flex-wrap py-2 px-1" role="group" aria-label="Global filters">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        Filter
      </span>
      {[
        { key: "bow_type", label: "Bow type" },
        { key: "round_name", label: "Round" },
        { key: "gender", label: "Gender" },
        { key: "age_category", label: "Age" },
      ].map(f => (
        <select
          key={f.key}
          value={filters[f.key] || ""}
          onChange={e => set(f.key, e.target.value)}
          className="text-xs py-1.5 px-3 rounded-full border cursor-pointer"
          style={{
            background: filters[f.key] ? "var(--accent-light)" : "var(--surface-1)",
            borderColor: filters[f.key] ? "var(--accent)" : "var(--border)",
            color: filters[f.key] ? "var(--accent)" : "var(--text-primary)",
            fontWeight: filters[f.key] ? 600 : 400,
          }}
          aria-label={f.label}
        >
          <option value="">{f.label}: All</option>
          {opts(f.key).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
      {hasActive && (
        <button onClick={clear} className="text-xs font-semibold py-1.5 px-3 rounded-full border-none cursor-pointer"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
          Clear
        </button>
      )}
    </div>
  );
}
