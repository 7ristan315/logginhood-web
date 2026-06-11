"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { normPct, stdDev } from "@/lib/rounds";

const TABS = [
  ["trend", "Trend"],
  ["velocity", "Velocity"],
  ["golds", "Golds"],
  ["stats", "Stats"],
];

export default function ProgressCharts({ scores }) {
  const allRounds = useMemo(
    () => [...new Set(scores.map((s) => s.round_name))].sort(),
    [scores]
  );
  const [sub, setSub] = useState("trend");
  const [round, setRound] = useState(allRounds[0] ?? "");
  const [mode, setMode] = useState("raw");
  const stats = useMemoStats(scores, allRounds);

  if (!scores.length) {
    return (
      <div className="card text-center text-sm opacity-70">
        No rounds saved yet. Add a score to see your progress.
      </div>
    );
  }

  const byRound = scores
    .filter((s) => s.round_name === round)
    .slice()
    .sort((a, b) => new Date(a.shot_at) - new Date(b.shot_at));

  const trendData = byRound.map((s) => ({
    date: s.shot_at,
    value: mode === "pct" ? normPct(s.score, s.round_name) : s.score,
  }));

  const velocityData = byRound.slice(1).map((s, i) => ({
    date: s.shot_at,
    delta: s.score - byRound[i].score,
  }));

  const goldData = byRound.map((s) => ({ date: s.shot_at, golds: s.golds ?? 0 }));

  return (
    <div className="flex flex-col gap-4">
      <div className="tab-nav">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={sub === id ? "active" : ""}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {sub !== "stats" && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="input-field"
          >
            {allRounds.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {sub === "trend" && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "raw" ? "pct" : "raw"))}
              className="btn-secondary"
            >
              {mode === "pct" ? "% mode" : "Raw score"}
            </button>
          )}
        </div>
      )}

      {sub === "trend" && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--accent-light)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {sub === "velocity" && (
        velocityData.length < 1 ? (
          <p className="text-sm opacity-70">Need at least 2 sessions of {round}.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={velocityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--accent-light)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip formatter={(v) => `${v >= 0 ? "+" : ""}${v} pts`} />
              <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                {velocityData.map((d, i) => (
                  <Cell key={i} fill={d.delta >= 0 ? "#16a34a" : "#dc2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      )}

      {sub === "golds" && (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={goldData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--accent-light)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
            <Tooltip />
            <Bar dataKey="golds" fill="#b7860b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {sub === "stats" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Rounds shot" value={stats.total} />
            <Stat label="Avg (last 10)" value={stats.avg10} />
            <Stat label="Normalised avg" value={`${stats.avgNorm}%`} />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
              Consistency
            </h3>
            {stats.consistency.length === 0 ? (
              <p className="text-sm opacity-70">Need 2+ sessions per round.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stats.consistency.map((c) => (
                  <div key={c.round} className="flex items-center gap-3 text-sm">
                    <span className="flex-1">{c.round}</span>
                    <span className="opacity-70">{c.n} sessions</span>
                    <span className="font-medium">±{c.std} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
              PBs by round
            </h3>
            <div className="flex flex-col gap-2">
              {stats.pbByRound.map((r) => (
                <div key={r.round} className="flex items-center gap-3 text-sm">
                  <span className="flex-1">{r.round}</span>
                  <span className="opacity-70">{r.date}</span>
                  <span className="font-medium">
                    {r.score}{r.pct != null ? ` (${r.pct}%)` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function useMemoStats(scores, allRounds) {
  return useMemo(() => {
    const last10 = scores
      .slice()
      .sort((a, b) => new Date(b.shot_at) - new Date(a.shot_at))
      .slice(0, 10);
    const avg10 = Math.round(last10.reduce((s, h) => s + h.score, 0) / last10.length);

    const normScores = scores.map((h) => normPct(h.score, h.round_name)).filter((v) => v != null);
    const avgNorm = normScores.length
      ? Math.round((normScores.reduce((a, b) => a + b, 0) / normScores.length) * 10) / 10
      : 0;

    const consistency = allRounds
      .map((r) => {
        const d = scores.filter((s) => s.round_name === r);
        if (d.length < 2) return null;
        return { round: r, std: stdDev(d.map((s) => s.score)), n: d.length };
      })
      .filter(Boolean)
      .sort((a, b) => a.std - b.std);

    const pbByRound = allRounds
      .map((r) => {
        const d = scores.filter((s) => s.round_name === r);
        if (!d.length) return null;
        const pb = d.slice().sort((a, b) => b.score - a.score)[0];
        return { round: r, score: pb.score, date: pb.shot_at, pct: normPct(pb.score, r) };
      })
      .filter(Boolean);

    return { total: scores.length, avg10, avgNorm, consistency, pbByRound };
  }, [scores, allRounds]);
}
