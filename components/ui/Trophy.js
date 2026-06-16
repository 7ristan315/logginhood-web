"use client";

const THEMES = {
  1: {
    cup:    "#F59E0B",
    shine:  "#FDE68A",
    shadow: "#B45309",
    base:   "#92400E",
    label:  "Gold",
    glow:   "rgba(251,191,36,0.25)",
    stars:  true,
  },
  2: {
    cup:    "#9CA3AF",
    shine:  "#E5E7EB",
    shadow: "#4B5563",
    base:   "#374151",
    label:  "Silver",
    glow:   "rgba(156,163,175,0.2)",
    stars:  false,
  },
  3: {
    cup:    "#CD7C2F",
    shine:  "#F5C07A",
    shadow: "#92400E",
    base:   "#78350F",
    label:  "Bronze",
    glow:   "rgba(205,124,47,0.2)",
    stars:  false,
  },
};

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Trophy({ position = 1, size = "md", showLabel = false }) {
  const t = THEMES[position] ?? THEMES[1];
  const dim = size === "sm" ? 44 : size === "lg" ? 80 : 60;

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ filter: `drop-shadow(0 2px 8px ${t.glow})` }}>
        <svg
          viewBox="0 0 60 76"
          width={dim}
          height={dim}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${t.label} trophy`}
        >
          {/* Left handle */}
          <path
            d="M14,18 Q4,18 4,28 Q4,38 14,40"
            fill="none"
            stroke={t.cup}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right handle */}
          <path
            d="M46,18 Q56,18 56,28 Q56,38 46,40"
            fill="none"
            stroke={t.cup}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Cup body */}
          <path
            d="M14,10 Q30,6 46,10 L40,46 Q30,50 20,46 Z"
            fill={t.cup}
          />
          {/* Shine highlight */}
          <path
            d="M21,14 Q23,28 21,42"
            fill="none"
            stroke={t.shine}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Engraved band */}
          <path
            d="M17,35 Q30,38 43,35"
            fill="none"
            stroke={t.shadow}
            strokeWidth="1.5"
            opacity="0.5"
          />
          {/* Stars for gold */}
          {t.stars && (
            <>
              <text x="28" y="28" textAnchor="middle" fontSize="10" fill={t.shine} opacity="0.9">★</text>
            </>
          )}
          {/* Stem */}
          <rect x="26" y="50" width="8" height="12" rx="2" fill={t.shadow} />
          {/* Base plate */}
          <rect x="17" y="62" width="26" height="7" rx="3" fill={t.base} />
          {/* Base shine */}
          <rect x="19" y="63" width="22" height="2" rx="1" fill={t.shadow} opacity="0.4" />
        </svg>
      </div>
      {showLabel && (
        <span className="text-xs font-semibold opacity-60">{MEDALS[position]} {t.label}</span>
      )}
    </div>
  );
}

export function TrophyRow({ trophies = [] }) {
  if (!trophies.length) return null;
  return (
    <div className="flex items-end gap-3">
      {trophies.map((tr) => (
        <div key={tr.id} className="flex flex-col items-center gap-1">
          <Trophy position={tr.position} size="sm" />
          <span className="max-w-[64px] truncate text-center text-xs opacity-60 leading-tight">
            {tr.competitions?.name ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrophyCabinet({ trophies = [] }) {
  if (!trophies.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center opacity-50">
        <span className="text-4xl">🏺</span>
        <p className="text-sm">No trophies yet — enter a competition!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {trophies.map((tr) => (
        <div
          key={tr.id}
          className="flex items-center gap-4 rounded-xl p-3"
          style={{ background: "var(--accent-light)" }}
        >
          <Trophy position={tr.position} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {MEDALS[tr.position]} {tr.competitions?.name}
            </p>
            <p className="text-xs opacity-60">
              {tr.competitions?.round_name} · {tr.competitions?.end_date
                ? new Date(tr.competitions.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
                : ""}
            </p>
            {tr.competitions?.clubs?.name && (
              <p className="text-xs opacity-40">Hosted by {tr.competitions.clubs.name}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
