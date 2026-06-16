"use client";

import { useMemo, useState } from "react";
import { Pill } from "@/components/ui";

const INDOOR_ROUNDS = ["Bray I", "Bray II", "Portsmouth", "Stafford", "WA 18m", "WA 25m", "Worcester"];
const OUTDOOR_ROUNDS = ["York", "Hereford", "Windsor", "National", "WA 70m", "WA 60m", "WA 1440 (Gents)", "WA 1440 (Ladies)"];

const AGE_GROUPS = [
  { label: "All", values: null },
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

const GOV_BODIES = [
  { label: "All", value: null },
  { label: "Archery GB", value: "AGB" },
  { label: "World Archery", value: "WA" },
];

function govBody(roundName) {
  return roundName?.startsWith("WA ") ? "WA" : "AGB";
}

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_BG = [
  "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700",
  "bg-gray-50 dark:bg-gray-900/30 border-gray-300 dark:border-gray-600",
  "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700",
];
const MEDAL_SCORE = [
  "text-yellow-700 dark:text-yellow-400",
  "text-gray-600 dark:text-gray-300",
  "text-orange-700 dark:text-orange-400",
];

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

function topN(scores, n = 3) {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, n);
}

function RecordRow({ round, topScores }) {
  const isEmpty = topScores.length === 0;
  return (
    <tr className="border-b border-accent-light last:border-0 hover:bg-accent-light/20 transition-colors">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{round}</td>
      {isEmpty ? (
        <td colSpan={3} className="px-4 py-3 text-sm opacity-30 text-center">No scores</td>
      ) : (
        <>
          {[0, 1, 2].map((i) => {
            const s = topScores[i];
            if (!s) return (
              <td key={i} className="px-4 py-3">
                <div className="opacity-20 text-xs text-center">—</div>
              </td>
            );
            return (
              <td key={i} className="px-3 py-2">
                <div className={`rounded-lg border px-3 py-2 ${MEDAL_BG[i]}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">{MEDALS[i]}</span>
                    <span className={`font-bold tabular-nums text-sm ${MEDAL_SCORE[i]}`}>{s.score}</span>
                  </div>
                  <div className="text-xs font-medium truncate max-w-[120px]">{s.full_name}</div>
                  <div className="text-xs opacity-50 tabular-nums">{formatDate(s.shot_at)}</div>
                </div>
              </td>
            );
          })}
        </>
      )}
    </tr>
  );
}

function RecordsSection({ title, rounds, scores }) {
  const byRound = useMemo(() => {
    const map = {};
    for (const r of rounds) map[r] = [];
    for (const s of scores) if (map[s.round_name] !== undefined) map[s.round_name].push(s);
    return map;
  }, [rounds, scores]);

  const hasAny = rounds.some((r) => byRound[r].length > 0);

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-accent-light">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-accent-light bg-accent-light/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60 w-36">Round</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                <span className="text-yellow-600 dark:text-yellow-400">🥇</span> 1st
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                <span className="text-gray-500">🥈</span> 2nd
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                <span className="text-orange-600 dark:text-orange-400">🥉</span> 3rd
              </th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <RecordRow key={r} round={r} topScores={topN(byRound[r])} />
            ))}
          </tbody>
        </table>
      </div>
      {!hasAny && (
        <p className="mt-2 text-center text-xs opacity-40">No scores recorded yet.</p>
      )}
    </div>
  );
}

export default function ClubRecords({ scores }) {
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [gender, setGender] = useState(GENDERS[0]);
  const [bowType, setBowType] = useState(BOW_TYPES[0]);
  const [gov, setGov] = useState(GOV_BODIES[0]);

  const filtered = useMemo(() => {
    let result = scores;
    if (ageGroup.values) result = result.filter((s) => ageGroup.values.includes(s.age_category));
    if (gender.value) result = result.filter((s) => s.gender === gender.value);
    if (bowType.value) result = result.filter((s) => s.bow_type === bowType.value);
    if (gov.value) result = result.filter((s) => govBody(s.round_name) === gov.value);
    return result;
  }, [scores, ageGroup, gender, bowType, gov]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Filters */}
      <div className="card flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Age group</p>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ag) => (
              <Pill key={ag.label} active={ageGroup.label === ag.label} onClick={() => setAgeGroup(ag)}>
                {ag.label}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Gender</p>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <Pill key={g.label} active={gender.value === g.value} onClick={() => setGender(g)}>
                {g.label}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Bow type</p>
          <div className="flex flex-wrap gap-2">
            {BOW_TYPES.map((b) => (
              <Pill key={b.label} active={bowType.value === b.value} onClick={() => setBowType(b)}>
                {b.label}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Governing body</p>
          <div className="flex gap-2">
            {GOV_BODIES.map((g) => (
              <Pill key={g.label} active={gov.value === g.value} onClick={() => setGov(g)}>
                {g.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {/* Indoor records */}
      <RecordsSection title="Indoor rounds" rounds={INDOOR_ROUNDS} scores={filtered} />

      {/* Outdoor records */}
      <RecordsSection title="Outdoor rounds" rounds={OUTDOOR_ROUNDS} scores={filtered} />
    </div>
  );
}
