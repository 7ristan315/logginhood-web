"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export default function EquipmentJourney({ journey, filtered }) {
  const versionTimeline = useMemo(() => {
    const bySetup = {};
    (filtered.journey || []).forEach(r => {
      const key = `${r.riser || "?"} + ${r.limbs || "?"}`;
      if (!bySetup[key]) bySetup[key] = [];
      bySetup[key].push({ version: r.version, avg: r.avg_score, rounds: r.round_count, first: r.first_used, last: r.last_used, riser: r.riser, limbs: r.limbs, sight: r.sight_name });
    });
    return Object.entries(bySetup)
      .filter(([, versions]) => versions.length >= 2)
      .map(([name, versions]) => ({
        name: name.length > 30 ? name.slice(0, 28) + "…" : name,
        versions: versions.sort((a, b) => a.version - b.version),
        improvement: versions.length >= 2 ? Math.round(versions[versions.length - 1].avg - versions[0].avg) : 0,
      }))
      .sort((a, b) => b.versions.length - a.versions.length)
      .slice(0, 8);
  }, [filtered.journey]);

  return (
    <div className="flex flex-col gap-6">
      {versionTimeline.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">📈</span>
          <p className="text-sm font-medium">No equipment journey data yet</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Equipment journey tracks how scores change across setup versions. Requires archers with multiple setup versions.
          </p>
        </div>
      ) : (
        <>
          {/* Version timeline charts */}
          {versionTimeline.map(setup => (
            <div key={setup.name} className="card">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{setup.name}</h3>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{setup.versions.length} versions tracked</p>
                </div>
                <span className={`text-sm font-bold py-1 px-3 rounded-full ${setup.improvement >= 0 ? "" : ""}`}
                  style={{ background: setup.improvement >= 0 ? "var(--success-light)" : "var(--danger-light)", color: setup.improvement >= 0 ? "var(--success-text)" : "var(--danger-text)" }}>
                  {setup.improvement >= 0 ? "+" : ""}{setup.improvement} pts
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={setup.versions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="version" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} tickFormatter={v => `v${v}`} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={v => `Version ${v}`} />
                  <Line type="monotone" dataKey="avg" name="Avg score" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-2 mt-3 flex-wrap">
                {setup.versions.map(v => (
                  <div key={v.version} className="text-xs py-1.5 px-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <span className="font-semibold" style={{ color: "var(--accent)" }}>v{v.version}</span>
                    <span className="mx-1.5" style={{ color: "var(--text-tertiary)" }}>·</span>
                    <span>{v.avg} avg</span>
                    <span className="mx-1.5" style={{ color: "var(--text-tertiary)" }}>·</span>
                    <span style={{ color: "var(--text-tertiary)" }}>{v.rounds} rounds</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary table */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">All equipment journeys</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Riser", "Limbs", "Sight", "Version", "Avg", "Rounds", "First used", "Last used"].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(filtered.journey || []).slice(0, 30).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="py-2 px-3 font-medium">{r.riser || "—"}</td>
                      <td className="py-2 px-3">{r.limbs || "—"}</td>
                      <td className="py-2 px-3">{r.sight_name || "—"}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs font-bold py-0.5 px-2 rounded-full" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>v{r.version}</span>
                      </td>
                      <td className="py-2 px-3 font-bold" style={{ color: "var(--accent)" }}>{r.avg_score}</td>
                      <td className="py-2 px-3">{r.round_count}</td>
                      <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{r.first_used}</td>
                      <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{r.last_used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
