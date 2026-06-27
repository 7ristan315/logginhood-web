"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)","var(--chart-6)","var(--chart-7)","var(--chart-8)"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export default function MarketIntelligence({ marketShare, equipPerf, switching, filtered }) {
  const categories = useMemo(() => {
    const result = {};
    ["riser", "limbs", "sight_name", "button_name"].forEach(key => {
      const label = { riser: "Risers", limbs: "Limbs", sight_name: "Sights", button_name: "Buttons" }[key];
      const byItem = {};
      (filtered.market || []).forEach(r => {
        const name = r[key] || "Unknown";
        if (name === "Unknown") return;
        byItem[name] = (byItem[name] || 0) + r.archer_count;
      });
      const items = Object.entries(byItem)
        .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      if (items.length > 0) result[key] = { label, items };
    });
    return result;
  }, [filtered.market]);

  const switchingStats = useMemo(() => {
    if (!switching?.length) return null;
    const flowMap = {};
    switching.forEach(s => {
      const key = `v${s.from_version}→v${s.to_version}`;
      if (!flowMap[key]) flowMap[key] = { label: key, count: 0, scores: [] };
      flowMap[key].count++;
      if (s.first_score_after) flowMap[key].scores.push(s.first_score_after);
    });
    return Object.values(flowMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(f => ({
        ...f,
        avgScore: f.scores.length ? Math.round(f.scores.reduce((a, b) => a + b, 0) / f.scores.length) : null,
      }));
  }, [switching]);

  const competitorMatrix = useMemo(() => {
    const byProduct = {};
    (filtered.equip || []).forEach(r => {
      const key = r.riser || "Unknown";
      if (key === "Unknown") return;
      if (!byProduct[key]) byProduct[key] = { name: key, totalScore: 0, totalN: 0, stddevSum: 0 };
      byProduct[key].totalScore += r.avg_score * r.sample_size;
      byProduct[key].totalN += r.sample_size;
      byProduct[key].stddevSum += (r.score_stddev || 0) * r.sample_size;
    });
    const marketMap = {};
    (filtered.market || []).forEach(r => {
      if (r.riser) marketMap[r.riser] = (marketMap[r.riser] || 0) + r.archer_count;
    });
    return Object.values(byProduct)
      .filter(p => p.totalN >= 10)
      .map(p => ({
        name: p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name,
        avg: Math.round(p.totalScore / p.totalN),
        consistency: Math.max(0, Math.round(100 - p.stddevSum / p.totalN)),
        share: marketMap[p.name] || 0,
        samples: p.totalN,
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 15);
  }, [filtered.equip, filtered.market]);

  return (
    <div className="flex flex-col gap-6">
      {/* Market share by category */}
      <div className="grid-responsive-2" style={{ gap: 16 }}>
        {Object.entries(categories).map(([key, { label, items }]) => (
          <div key={key} className="card">
            <h3 className="text-sm font-semibold mb-3">{label} market share</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={items} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""} style={{ fontSize: 10 }}>
                  {items.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Competitor matrix */}
      {competitorMatrix.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Competitor matrix</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
            All products ranked by market share with performance metrics. Min 10 samples.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Product", "Market share", "Avg score", "Consistency", "Samples"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitorMatrix.map((p, i) => (
                  <tr key={p.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="py-2 px-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {p.name}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold" style={{ color: "var(--accent)" }}>{p.share}</td>
                    <td className="py-2 px-3">{p.avg}</td>
                    <td className="py-2 px-3">
                      <span className="text-xs font-semibold py-0.5 px-2 rounded-full"
                        style={{ background: p.consistency > 80 ? "var(--success-light)" : p.consistency > 60 ? "var(--warning-light)" : "var(--danger-light)", color: p.consistency > 80 ? "var(--success-text)" : p.consistency > 60 ? "var(--warning-text)" : "var(--danger-text)" }}>
                        {p.consistency}%
                      </span>
                    </td>
                    <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{p.samples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Switching events */}
      {switchingStats && switchingStats.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Equipment switching events</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
            When archers change setup versions between consecutive scored rounds.
          </p>
          <div className="flex flex-col gap-2">
            {switchingStats.map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold" style={{ color: "var(--accent)" }}>{s.label}</span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{s.count} event{s.count !== 1 ? "s" : ""}</span>
                </div>
                {s.avgScore && (
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Avg score after: {s.avgScore}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
