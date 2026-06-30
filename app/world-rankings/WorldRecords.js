"use client";

import { useRouter } from "next/navigation";
import { useTransition, useCallback } from "react";
import { Pill } from "@/components/ui";

const AGE_GROUPS = [
  { label: "All",    value: null },
  { label: "Junior", value: "Junior" },
  { label: "Senior", value: "Senior" },
  { label: "50+",    value: "50+" },
  { label: "60+",    value: "60+" },
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
  { label: "All",           value: null },
  { label: "Archery GB",    value: "AGB" },
  { label: "World Archery", value: "WA" },
];

const MEDALS    = ["🥇", "🥈", "🥉"];
const MEDAL_BG  = [
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

function RecordsTable({ title, rows }) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-accent-light">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-accent-light bg-accent-light/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60 w-36">Round</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60"><span className="text-yellow-600 dark:text-yellow-400">🥇</span> 1st</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60"><span className="text-gray-500">🥈</span> 2nd</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60"><span className="text-orange-600 dark:text-orange-400">🥉</span> 3rd</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ round, top }) => (
              <tr key={round} className="border-b border-accent-light last:border-0 hover:bg-accent-light/20 transition-colors">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{round}</td>
                {top.length === 0 ? (
                  <td colSpan={3} className="px-4 py-3 text-sm opacity-30 text-center">No scores</td>
                ) : (
                  [0, 1, 2].map((i) => {
                    const s = top[i];
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function WorldRecords({ records, params }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback((updates) => {
    const next = new URLSearchParams();
    next.set("tab", "records");
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "" && k !== "tab") next.set(k, String(v));
    }
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, String(v));
    }
    startTransition(() => router.push(`/world-rankings?${next.toString()}`));
  }, [params, router]);

  const age    = params.age    ?? null;
  const gender = params.gender ?? null;
  const bow    = params.bow    ?? null;
  const gov    = params.gov    ?? null;

  return (
    <div className="flex flex-col gap-6 pt-4" style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}>
      <div className="card flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Age group</p>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ag) => (
              <Pill key={ag.label} active={age === ag.value} onClick={() => navigate({ age: ag.value })}>{ag.label}</Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">Gender</p>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <Pill key={g.label} active={gender === g.value} onClick={() => navigate({ gender: g.value })}>{g.label}</Pill>
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
      </div>

      <RecordsTable title="Indoor rounds"  rows={records.indoor} />
      <RecordsTable title="Outdoor rounds" rows={records.outdoor} />
    </div>
  );
}
