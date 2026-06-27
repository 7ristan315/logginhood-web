import Skeleton from "./Skeleton";

export default function DataCard({ label, value, change, changeLabel, icon, color, sparkline, loading = false, onClick, className = "" }) {
  if (loading) {
    return (
      <div className={`card flex flex-col gap-2 ${className}`}>
        <Skeleton style={{ height: 12, width: "40%", borderRadius: 4 }} />
        <Skeleton style={{ height: 32, width: "60%", borderRadius: 4 }} />
        <Skeleton style={{ height: 10, width: "30%", borderRadius: 4 }} />
      </div>
    );
  }

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div
      className={`card flex flex-col gap-1.5 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      style={{
        borderTop: color ? `3px solid ${color}` : undefined,
        transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </span>
        {icon && <span className="text-lg" style={{ color: "var(--text-tertiary)" }} aria-hidden="true">{icon}</span>}
      </div>

      <span
        className="text-2xl font-bold tabular-nums leading-none"
        style={{ color: color || "var(--accent)" }}
      >
        {value ?? "—"}
      </span>

      <div className="flex items-center justify-between gap-2">
        {change !== undefined && change !== null && (
          <span
            className="text-xs font-medium"
            style={{ color: isPositive ? "var(--success)" : isNegative ? "var(--danger)" : "var(--text-tertiary)" }}
            aria-label={`${isPositive ? "Up" : isNegative ? "Down" : "No change"} ${Math.abs(change)}${changeLabel ? " " + changeLabel : ""}`}
          >
            <span aria-hidden="true">{isPositive ? "↑" : isNegative ? "↓" : "→"} </span>
            {Math.abs(change)}{changeLabel && <span className="ml-1 opacity-70">{changeLabel}</span>}
          </span>
        )}
        {sparkline && <div className="flex-shrink-0">{sparkline}</div>}
      </div>
    </div>
  );
}
