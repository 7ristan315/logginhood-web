export default function ProgressBar({ value, max = 100, label, showValue = true, size = "md", color, className = "" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span style={{ color: "var(--text-secondary)" }}>{label}</span>}
          {showValue && <span className="font-medium tabular-nums" style={{ color: color || "var(--accent)" }}>{value}/{max}</span>}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${heights[size]}`}
        style={{ background: "var(--surface-3)" }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`${heights[size]} rounded-full`}
          style={{
            width: `${pct}%`,
            background: color || "var(--accent)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
