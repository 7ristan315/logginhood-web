"use client";

import { useEffect, useMemo, useState } from "react";
import { Pill } from "@/components/ui";
import Table from "@/components/ui/Table";
import { bestClassForBow } from "@/lib/classification";

const INDOOR_ROUNDS = ["Bray I","Bray II","Portsmouth","Stafford","WA 18m","WA 25m","Worcester"];
const OUTDOOR_ROUNDS = ["York","Hereford","Windsor","National","WA 70m","WA 60m","WA 1440 (Gents)","WA 1440 (Ladies)"];

const AGE_GROUPS = [
  { label: "All ages", values: null },
  { label: "Junior", values: ["U12","U14","U15","U16","U18"] },
  { label: "Senior", values: ["Senior"] },
  { label: "50+", values: ["50+"] },
  { label: "60+", values: ["60+"] },
];

const GENDERS = [
  { label: "All", value: null },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const BOW_TYPES = [
  { label: "All", value: null },
  { label: "Recurve", value: "Recurve" },
  { label: "Compound", value: "Compound" },
  { label: "Barebow", value: "Barebow" },
  { label: "Longbow", value: "Longbow" },
];

const GOV_BODIES = [
  { label: "All", value: null },
  { label: "Archery GB", value: "AGB" },
  { label: "World Archery", value: "WA" },
];

function govBody(roundName) {
  return roundName?.startsWith("WA ") ? "WA" : "AGB";
}

const COLUMNS = [
  {
    key: "_rank", label: "#",
    render: (v) => <span className="text-xs tabular-nums opacity-40">{v}</span>,
  },
  { key: "full_name", label: "Archer", render: (v) => <span className="font-medium">{v}</span> },
  { key: "club_name", label: "Club", render: (v) => <span className="text-sm opacity-70" title={v}>{v?.split(' ').map(w=>w[0]).join('').toUpperCase() ?? '—'}</span> },
  { key: "round_name", label: "Round" },
  { key: "shot_at", label: "Date", render: (v) => <span className="tabular-nums opacity-70" style={{ whiteSpace: "nowrap" }}>{v}</span> },
  {
    key: "score", label: "Score", align: "right",
    render: (v) => <span className="font-semibold tabular-nums" style={{ color: "var(--accent)" }}>{v}</span>,
  },
  {
    key: "golds", label: "Golds", align: "right",
    render: (v) => <span className="tabular-nums opacity-70">{v ?? "—"}</span>,
  },
  {
    key: "classification", label: "Class",
    render: (v) => v
      ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{v}</span>
      : <span className="opacity-30">—</span>,
  },
  { key: "bow_type", label: "Bow", render: (v) => <span className="text-sm opacity-70">{v ?? "—"}</span> },
  { key: "age_category", label: "Age", render: (v) => <span className="text-sm opacity-70">{v ?? "—"}</span> },
];

function RoundGroup({ label, emoji, rounds, selected, onToggle, bg }) {
  if (!rounds.length) return null;
  return (
    <div className="flex-1 min-w-0 rounded-lg p-2.5" style={{ background: bg }}>
      <p className="mb-2 text-xs font-semibold opacity-50 uppercase tracking-wide">{emoji} {label}</p>
      <div className="flex flex-wrap gap-2">
        {rounds.map((r) => (
          <Pill key={r} active={selected.has(r)} onClick={() => onToggle(r)}>{r}</Pill>
        ))}
      </div>
    </div>
  );
}

export default function RankingsScores({ scores }) {
  // Pre-compute best classification per (profile_id, bow_type)
  const bestClsMap = useMemo(() => {
    const map = {};
    const pairs = [...new Set(scores.map(s => `${s.profile_id}|${s.bow_type}`))];
    for (const pair of pairs) {
      const [pid, bow] = pair.split("|");
      const sample = scores.find(s => s.profile_id === pid && s.bow_type === bow);
      map[pair] = bestClassForBow(scores, pid, bow, sample?.gender, sample?.age_category);
    }
    return map;
  }, [scores]);

  const scoredRows = useMemo(() =>
    scores.map(s => ({ ...s, classification: bestClsMap[`${s.profile_id}|${s.bow_type}`] ?? s.classification })),
    [scores, bestClsMap]
  );

  const availableRounds = useMemo(() => new Set(scoredRows.map((s) => s.round_name)), [scoredRows]);
  const indoorRounds = useMemo(() => INDOOR_ROUNDS.filter((r) => availableRounds.has(r)), [availableRounds]);
  const outdoorRounds = useMemo(() => OUTDOOR_ROUNDS.filter((r) => availableRounds.has(r)), [availableRounds]);

  const [selectedRounds, setSelectedRounds] = useState(new Set());
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [gender, setGender] = useState(GENDERS[0]);
  const [bowType, setBowType] = useState(BOW_TYPES[0]);
  const [gov, setGov] = useState(GOV_BODIES[0]);
  const [lastOnly, setLastOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  function toggleRound(r) {
    setSelectedRounds((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let result = scoredRows;
    if (selectedRounds.size > 0) result = result.filter((s) => selectedRounds.has(s.round_name));
    if (ageGroup.values) result = result.filter((s) => ageGroup.values.includes(s.age_category));
    if (gender.value) result = result.filter((s) => s.gender === gender.value);
    if (bowType.value) result = result.filter((s) => s.bow_type === bowType.value);
    if (gov.value) result = result.filter((s) => govBody(s.round_name) === gov.value);
    if (lastOnly) {
      const seen = new Set();
      const out = [];
      for (const s of result) {
        const key = `${s.profile_id}:${s.round_name}`;
        if (!seen.has(key)) { seen.add(key); out.push(s); }
      }
      result = out;
    }
    return result;
  }, [scores, selectedRounds, ageGroup, gender, bowType, gov, lastOnly]);

  const anyFilter = selectedRounds.size > 0 || ageGroup.values || gender.value || bowType.value || gov.value || lastOnly;

  const rankedRows = useMemo(
    () => filtered.map((s, i) => ({ ...s, _rank: i + 1 })),
    [filtered]
  );

  useEffect(() => { setPage(1); }, [filtered, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rankedRows.length / pageSize));
  const pageRows = rankedRows.slice((page - 1) * pageSize, page * pageSize);

  function clearAll() {
    setSelectedRounds(new Set());
    setAgeGroup(AGE_GROUPS[0]);
    setGender(GENDERS[0]);
    setBowType(BOW_TYPES[0]);
    setGov(GOV_BODIES[0]);
    setLastOnly(false);
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="card flex flex-col gap-4">

        {/* Round type — indoor / outdoor split */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Round type</p>
          <div className="flex flex-col gap-2">
            <RoundGroup
              label="Indoor" emoji="🏠"
              rounds={indoorRounds}
              selected={selectedRounds}
              onToggle={toggleRound}
              bg="rgba(99,102,241,0.06)"
            />
            <RoundGroup
              label="Outdoor" emoji="🌤️"
              rounds={outdoorRounds}
              selected={selectedRounds}
              onToggle={toggleRound}
              bg="rgba(34,197,94,0.06)"
            />
          </div>
        </div>

        {/* Row filters */}
        <div className="flex flex-wrap gap-x-8 gap-y-3" style={{ borderTop: "1px solid var(--accent-light)", paddingTop: "0.75rem" }}>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Gender</p>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <Pill key={g.label} active={gender.value === g.value} onClick={() => setGender(g)}>{g.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Age group</p>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((ag) => (
                <Pill key={ag.label} active={ageGroup.label === ag.label} onClick={() => setAgeGroup(ag)}>{ag.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Bow type</p>
            <div className="flex flex-wrap gap-2">
              {BOW_TYPES.map((b) => (
                <Pill key={b.label} active={bowType.value === b.value} onClick={() => setBowType(b)}>{b.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Governing body</p>
            <div className="flex gap-2">
              {GOV_BODIES.map((g) => (
                <Pill key={g.label} active={gov.value === g.value} onClick={() => setGov(g)}>{g.label}</Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">View</p>
            <Pill active={lastOnly} onClick={() => setLastOnly((v) => !v)}>Best score only</Pill>
          </div>
        </div>

        {anyFilter && (
          <div className="flex items-center justify-between" style={{ borderTop: "1px solid var(--accent-light)", paddingTop: "0.5rem" }}>
            <p className="text-xs opacity-50">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <button onClick={clearAll} style={{ color: "var(--accent)" }} className="text-xs hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <Table
        columns={COLUMNS}
        rows={pageRows}
        keyField="id"
        caption="World rankings scores"
        emptyState="No scores match these filters."
        striped
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="opacity-60">Per page:</span>
          {[25, 50, 100].map(n => (
            <button key={n} onClick={() => setPageSize(n)}
              className="px-2.5 py-1 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: pageSize === n ? "var(--accent)" : "var(--surface-2)", color: pageSize === n ? "var(--accent-foreground)" : "var(--text-secondary)" }}>
              {n}
            </button>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-2.5 py-1 rounded-lg border-none cursor-pointer"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)", opacity: page <= 1 ? 0.4 : 1 }}>
              ‹
            </button>
            <span style={{ color: "var(--text-tertiary)" }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
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
