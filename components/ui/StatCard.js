import Skeleton, { SkeletonText } from "./Skeleton";

function DeltaIndicator({ delta }) {
  if (!delta || delta.value === undefined || delta.value === null) return null;

  const isPositive = delta.value > 0;
  const isNegative = delta.value < 0;
  const color = isPositive
    ? "var(--stat-delta-pos, #16a34a)"
    : isNegative
    ? "var(--stat-delta-neg, #dc2626)"
    : "var(--foreground)";

  const arrow = isPositive ? "↑" : isNegative ? "↓" : "→";

  return (
    <span
      className="text-xs font-medium"
      style={{ color }}
      aria-label={`${isPositive ? "Up" : isNegative ? "Down" : "No change"} ${Math.abs(delta.value)}${delta.label ? " " + delta.label : ""}`}
    >
      <span aria-hidden="true">{arrow} </span>
      {Math.abs(delta.value)}
      {delta.label && <span className="opacity-70 ml-1">{delta.label}</span>}
    </span>
  );
}

export default function StatCard({ label, value, delta, icon, loading = false, className = "" }) {
  if (loading) {
    return (
      <div className={`card flex flex-col gap-2 ${className}`}>
        <Skeleton style={{ height: 14, width: "50%", borderRadius: 4 }} />
        <Skeleton style={{ height: 28, width: "65%", borderRadius: 4 }} />
        <Skeleton style={{ height: 12, width: "35%", borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div className={`card flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-50">{label}</p>
        {icon && (
          <span className="text-xl opacity-40" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: "var(--accent)" }}
      >
        {value ?? "—"}
      </p>
      {delta && <DeltaIndicator delta={delta} />}
    </div>
  );
}
