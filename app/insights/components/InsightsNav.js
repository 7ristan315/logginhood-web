"use client";

const SECTIONS = [
  { id: "overview",     label: "Overview",          icon: "◈" },
  { id: "products",     label: "Product Performance", icon: "⚡" },
  { id: "market",       label: "Market Intelligence", icon: "◉" },
  { id: "demographics", label: "Archer Demographics", icon: "👥" },
  { id: "arrows",       label: "Arrow Lab",         icon: "➡️" },
  { id: "journey",      label: "Equipment Journey",  icon: "📈" },
  { id: "competitive",  label: "Competitive Edge",   icon: "🏆" },
  { id: "methodology",  label: "Methodology",        icon: "📐" },
];

export { SECTIONS };

export default function InsightsNav({ active, onChange }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Insights sections">
      {SECTIONS.map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          role="tab"
          aria-selected={active === s.id}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer border-none transition-colors"
          style={{
            background: active === s.id ? "var(--accent)" : "transparent",
            color: active === s.id ? "var(--accent-foreground)" : "var(--text-secondary)",
            fontWeight: active === s.id ? 600 : 400,
          }}
        >
          <span className="text-sm" aria-hidden="true">{s.icon}</span>
          {s.label}
        </button>
      ))}
    </nav>
  );
}
