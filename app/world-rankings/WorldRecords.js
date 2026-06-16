"use client";

import { useMemo, useState } from "react";

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
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

// Top 3 unique members by best score per round
function topNUnique(scores, n = 3) {
  // Best score per member
  const bestPerMember = new Map();
  for (const s of scores) {
    const existing = bestPerMember.get(s.profile_id);
    if (!existing || s.score > existing.score) bestPerMember.set(s.profile_id, s);
  }
  return [...bestPerMember.values()].sort((a, b) => b.score - a.score).slice(0, n);
}

function RecordRow({ round, topScores }) {
  return (
    <tr className="border-b border-accent-light last:border-0 hover:bg-accent-light/20 transition-colors">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{round}</td>
      {topScores.length === 0 ? (
        <td colSpan={3} className="px-4 py-3 text-sm opacity-30 text-center">No scores</td>
      ) : (
        [0, 1, 2].map((i) => {
          const s = topScores[i];
          if (!s) return <td key={i} className="px-4 py-3"><div className="opacity-20 text-xs text-center">—</div></td>;
          return (
            <td key={i} className="px-3 py-2">
              <div className={`rounded-lg border px-3 py-2 ${MEDAL_BG[i]}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm">{MEDALS[i]}</span>
                  <span className={`font-bold tabular-nums text-sm ${MEDAL_SCORE[i]}`}>{s.score}</span>
                </div>
                <div className="text-xs font-medium truncate max-w-[120px]">{s.full_name}</div>
                <div className="text-xs opacity-60 truncate max-w-[120px]">{s.club_name}</div>
                <div className="text-xs opacity-50 tabular-nums">{formatDate(s.shot_at)}</div>
              </div>
            </td>
          );
        })
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
              <RecordRow key={r} round={r} topScores={topNUnique(byRound[r])} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function WorldRecords({ scores }) {
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [gender, setGender] = useState(GENDERS[0]);

  const filtered = useMemo(() => {
    let result = scores;
    if (ageGroup.values) result = result.filter((s) => ageGroup.values.includes(s.age_category));
    if (gender.value) result = result.filter((s) => s.gender === gender.value);
    return result;
  }, [scores, ageGroup, gender]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="card flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Age group</p>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.label}
                onClick={() => setAgeGroup(ag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  ageGroup.label === ag.label
                    ? "bg-accent text-accent-foreground"
                    : "border border-accent text-accent hover:bg-accent-light"
                }`}
              >
                {ag.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Gender</p>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.label}
                onClick={() => setGender(g)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  gender.value === g.value
                    ? "bg-accent text-accent-foreground"
                    : "border border-accent text-accent hover:bg-accent-light"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <RecordsSection title="Indoor rounds" rounds={INDOOR_ROUNDS} scores={filtered} />
      <RecordsSection title="Outdoor rounds" rounds={OUTDOOR_ROUNDS} scores={filtered} />
    </div>
  );
}
