"use client";

import { useMemo, useState } from "react";

const AGE_GROUPS = [
  { label: "All ages", values: null },
  { label: "Junior", values: ["U12", "U14", "U15", "U16", "U18"] },
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

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "bg-accent text-accent-foreground"
          : "border border-accent text-accent hover:bg-accent-light"
      }`}
    >
      {children}
    </button>
  );
}

export default function ClubScores({ scores }) {
  const allRounds = useMemo(
    () => [...new Set(scores.map((s) => s.round_name))].sort(),
    [scores]
  );

  const [selectedRounds, setSelectedRounds] = useState(new Set());
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [gender, setGender] = useState(GENDERS[0]);
  const [bowType, setBowType] = useState(BOW_TYPES[0]);
  const [lastOnly, setLastOnly] = useState(false);

  function toggleRound(r) {
    setSelectedRounds((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let result = scores;

    if (selectedRounds.size > 0) {
      result = result.filter((s) => selectedRounds.has(s.round_name));
    }
    if (ageGroup.values) {
      result = result.filter((s) => ageGroup.values.includes(s.age_category));
    }
    if (gender.value) {
      result = result.filter((s) => s.gender === gender.value);
    }
    if (bowType.value) {
      result = result.filter((s) => s.bow_type === bowType.value);
    }
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
  }, [scores, selectedRounds, ageGroup, gender, lastOnly]);

  const anyFilter = selectedRounds.size > 0 || ageGroup.values || gender.value || bowType.value || lastOnly;

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Filter panel */}
      <div className="card flex flex-col gap-4">
        {/* Round type — multi-select */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Round type</p>
          <div className="flex flex-wrap gap-2">
            {allRounds.map((r) => (
              <Pill key={r} active={selectedRounds.has(r)} onClick={() => toggleRound(r)}>{r}</Pill>
            ))}
          </div>
        </div>

        {/* Gender · Age group · View — in a row */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-accent-light pt-3">
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">View</p>
            <Pill active={lastOnly} onClick={() => setLastOnly((v) => !v)}>Last score only</Pill>
          </div>
        </div>

        {/* Active filter summary + clear */}
        {anyFilter && (
          <div className="flex items-center justify-between border-t border-accent-light pt-2">
            <p className="text-xs opacity-50">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => { setSelectedRounds(new Set()); setAgeGroup(AGE_GROUPS[0]); setGender(GENDERS[0]); setBowType(BOW_TYPES[0]); setLastOnly(false); }}
              className="text-xs text-accent hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Scores table */}
      {filtered.length === 0 ? (
        <div className="card py-10 text-center text-sm opacity-50">No scores match these filters.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-accent-light">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-accent-light bg-accent-light/40">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Round</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">Score</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">Golds</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Bow</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-accent-light transition-colors hover:bg-accent-light/30 ${
                    i % 2 === 0 ? "" : "bg-accent-light/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{s.full_name || "—"}</td>
                  <td className="px-4 py-3">{s.round_name}</td>
                  <td className="px-4 py-3 tabular-nums opacity-70">{s.shot_at}</td>
                  <td className="px-4 py-3 text-right font-semibold text-accent tabular-nums">{s.score}</td>
                  <td className="px-4 py-3 text-right tabular-nums opacity-70">{s.golds ?? "—"}</td>
                  <td className="px-4 py-3">
                    {s.classification ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                        {s.classification}
                      </span>
                    ) : (
                      <span className="opacity-30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm opacity-70">{s.bow_type ?? "—"}</td>
                  <td className="px-4 py-3 text-sm opacity-70">{s.age_category ?? "—"}</td>
                  <td className="px-4 py-3">
                    {s.status && s.status !== "Practice" ? (
                      <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">{s.status}</span>
                    ) : (
                      <span className="text-xs opacity-40">{s.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
