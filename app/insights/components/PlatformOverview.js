"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)","var(--chart-6)","var(--chart-7)","var(--chart-8)","var(--chart-9)","var(--chart-10)"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export default function PlatformOverview({ stats, equipPerf, marketShare, filtered }) {
  const riserShare = useMemo(() => {
    const byRiser = {};
    (filtered.market || []).forEach(r => {
      const key = r.riser || "Other";
      byRiser[key] = (byRiser[key] || 0) + r.archer_count;
    });
    return Object.entries(byRiser)
      .map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 14) + "…" : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered.market]);

  const topRisers = useMemo(() => {
    const byRiser = {};
    (filtered.equip || []).forEach(r => {
      const key = r.riser || "Unknown";
      if (!byRiser[key]) byRiser[key] = { name: key, total: 0, count: 0 };
      byRiser[key].total += r.avg_score * r.sample_size;
      byRiser[key].count += r.sample_size;
    });
    return Object.values(byRiser)
      .filter(r => r.count >= 10)
      .map(r => ({ name: r.name.length > 18 ? r.name.slice(0, 16) + "…" : r.name, avg: Math.round(r.total / r.count), n: r.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [filtered.equip]);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Archers", value: stats?.total_archers?.toLocaleString(), icon: "👤", color: "var(--chart-1)" },
          { label: "Rounds scored", value: stats?.total_rounds?.toLocaleString(), icon: "🎯", color: "var(--chart-2)" },
          { label: "Equipment-linked", value: stats?.rounds_with_setup?.toLocaleString(), icon: "🔗", color: "var(--chart-5)" },
          { label: "Active (30d)", value: stats?.active_archers_30d?.toLocaleString(), icon: "📊", color: "var(--chart-3)" },
        ].map(s => (
          <div key={s.label} className="card flex flex-col gap-1" style={{ borderTop: `3px solid ${s.color}` }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{s.label}</span>
            <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value ?? "—"}</span>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid-responsive-2" style={{ gap: 16 }}>
        {/* Riser market share */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-4">Riser market share</h3>
          {riserShare.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riserShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2}
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""} style={{ fontSize: 11 }}>
                  {riserShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: "var(--text-tertiary)" }}>No data available</div>
          )}
        </div>

        {/* Top performing risers */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-4">Top performing risers</h3>
          {topRisers.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRisers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} avg`, "Score"]} />
                <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                  {topRisers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: "var(--text-tertiary)" }}>No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
