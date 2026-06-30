"use client";

import { useRouter } from "next/navigation";
import { useTransition, useCallback } from "react";
import { Pill } from "@/components/ui";
import Table from "@/components/ui/Table";

const INDOOR_ROUNDS = ["Bray I","Bray II","Portsmouth","Stafford","WA 18m","WA 25m","Worcester"];
const OUTDOOR_ROUNDS = ["York","Hereford","Windsor","National","WA 70m","WA 60m","WA 1440 (Gents)","WA 1440 (Ladies)"];

const AGE_GROUPS = [
  { label: "All ages", value: null },
  { label: "Junior",   value: "Junior" },
  { label: "Senior",   value: "Senior" },
  { label: "50+",      value: "50+" },
  { label: "60+",      value: "60+" },
];

const GENDERS = [
  { label: "All",    value: null },
  { label: "Male",   value: "Male" },
  { label: "Female", value: "Female" },
];

const BOW_TYPES = [
  { label: "All",      value: null },
  { label: "Recurve",  value: "Recurve" },
  { label: "Compound", value: "Compound" },
  { label: "Barebow",  value: "Barebow" },
  { label: "Longbow",  value: "Longbow" },
];

const GOV_BODIES = [
  { label: "All",          value: null },
  { label: "Archery GB",   value: "AGB" },
  { label: "World Archery", value: "WA" },
];

const COLUMNS = [
  { key: "_rank",              label: "#",     render: (v) => <span className="text-xs tabular-nums opacity-40">{v}</span> },
  { key: "full_name",          label: "Archer", render: (v) => <span className="font-medium">{v}</span> },
  { key: "club_name",          label: "Club",   render: (v) => <span className="text-sm opacity-70" title={v}>{v?.split(" ").map(w => w[0]).join("").toUpperCase() ?? "—"}</span> },
  { key: "round_name",         label: "Round" },
  { key: "shot_at",            label: "Date",   render: (v) => <span className="tabular-nums opacity-70" style={{ whiteSpace: "nowrap" }}>{v}</span> },
  { key: "score",              label: "Score",  align: "right", render: (v) => <span className="font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{v}</span> },
  { key: "golds",              label: "Golds",  align: "right", render: (v) => <span className="tabular-nums opacity-70">{v ?? "—"}</span> },
  { key: "best_classification", label: "Class", render: (v) => v
    ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{v}</span>
    : <span className="opacity-30">—</span> },
  { key: "bow_type",           label: "Bow",    render: (v) => <span className="text-sm opacity-70">{v ?? "—"}</span> },
  { key: "age_category",       label: "Age",    render: (v) => <span className="text-sm opacity-70">{v ?? "—"}</span> },
];

function RoundGroup({ label, emoji, rounds, selectedRounds, onToggle, bg }) {
  if (!rounds.length) return null;
  return (
    <div className="flex-1 min-w-0 rounded-lg p-2.5" style={{ background: bg }}>
      <p className="mb-2 text-xs font-semibold opacity-50 uppercase tracking-wide">{emoji} {label}</p>
      <div className="flex flex-wrap gap-2">
        {rounds.map((r) => (
          <Pill key={r} active={selectedRounds.has(r)} onClick={() => onToggle(r)}>{r}</Pill>
        ))}
      </div>
    </div>
  );
}

export default function RankingsScores({ rows, total, page, size, params }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback((updates) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "") next.set(k, String(v));
    }
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, String(v));
    }
    if (!("page" in updates)) next.delete("page");
    startTransition(() => router.push(`/world-rankings?${next.toString()}`));
  }, [params, router]);

  const selectedRounds = params.rounds ? new Set(params.rounds.split(",")) : new Set();
  const bow    = params.bow    ?? null;
  const age    = params.age    ?? null;
  const gender = params.gender ?? null;
  const gov    = params.gov    ?? null;
  const last   = params.last === "1";

  function toggleRound(r) {
    const next = new Set(selectedRounds);
    next.has(r) ? next.delete(r) : next.add(r);
    navigate({ rounds: next.size > 0 ? [...next].join(",") : null });
  }

  const anyFilter = selectedRounds.size > 0 || age || gender || bow || gov || last;
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="flex flex-col gap-4 pt-4" style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}>
      <div className="card flex flex-col gap-4">

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Round type</p>
          <div className="flex flex-col gap-2">
            <RoundGroup label="Indoor" emoji="🏠" rounds={INDOOR_ROUNDS} selectedRounds={selectedRounds} onToggle={toggleRound} bg="rgba(99,102,241,0.06)" />
            <RoundGroup label="Outdoor" emoji="🌤️" rounds={OUTDOOR_ROUNDS} selectedRounds={selectedRounds} onToggle={toggleRound} bg="rgba(34,197,94,0.06)" />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3" style={{ borderTop: "1px solid var(--accent-light)", paddingTop: "0.75rem" }}>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Gender</p>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <Pill key={g.label} active={gender === g.value} onClick={() => navigate({ gender: g.value })}>{g.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Age group</p>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((ag) => (
                <Pill key={ag.label} active={age === ag.value} onClick={() => navigate({ age: ag.value })}>{ag.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Bow type</p>
            <div className="flex flex-wrap gap-2">
              {BOW_TYPES.map((b) => (
                <Pill key={b.label} active={bow === b.value} onClick={() => navigate({ bow: b.value })}>{b.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Governing body</p>
            <div className="flex gap-2">
              {GOV_BODIES.map((g) => (
                <Pill key={g.label} active={gov === g.value} onClick={() => navigate({ gov: g.value })}>{g.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">View</p>
            <Pill active={last} onClick={() => navigate({ last: last ? null : "1" })}>Best score only</Pill>
          </div>
        </div>

        {anyFilter && (
          <div className="flex items-center justify-between" style={{ borderTop: "1px solid var(--accent-light)", paddingTop: "0.5rem" }}>
            <p className="text-xs opacity-50">{total} result{total !== 1 ? "s" : ""}</p>
            <a href="/world-rankings" style={{ color: "var(--accent)" }} className="text-xs hover:underline">Clear all filters</a>
          </div>
        )}
      </div>

      <Table columns={COLUMNS} rows={rows} keyField="id" caption="World rankings scores" emptyState="No scores match these filters." striped />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="opacity-60">Per page:</span>
          {[25, 50, 100].map(n => (
            <button key={n} onClick={() => navigate({ size: String(n), page: "1" })}
              className="px-2.5 py-1 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: size === n ? "var(--accent)" : "var(--surface-2)", color: size === n ? "var(--accent-foreground)" : "var(--text-secondary)" }}>
              {n}
            </button>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => navigate({ page: String(page - 1) })} disabled={page <= 1}
              className="px-2.5 py-1 rounded-lg border-none cursor-pointer"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page <= 1 ? 0.4 : 1 }}>
              ‹
            </button>
            <span style={{ color: "var(--text-tertiary)" }}>Page {page} of {totalPages}</span>
            <button onClick={() => navigate({ page: String(page + 1) })} disabled={page >= totalPages}
              className="px-2.5 py-1 rounded-lg border-none cursor-pointer"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page >= totalPages ? 0.4 : 1 }}>
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
