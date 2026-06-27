"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-3)"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export default function CompetitiveEdge({ equipPerf, filtered }) {
  const compVsPractice = useMemo(() => {
    const byStatus = { Competition: {}, Practice: {} };
    (filtered.equip || []).forEach(r => {
      const riser = r.riser || "Unknown";
      if (riser === "Unknown") return;
      ["Competition", "Practice"].forEach(status => {
        if (!byStatus[status][riser]) byStatus[status][riser] = { total: 0, count: 0, stddev: 0 };
        byStatus[status][riser].total += r.avg_score * r.sample_size;
        byStatus[status][riser].count += r.sample_size;
        byStatus[status][riser].stddev += (r.score_stddev || 0) * r.sample_size;
      });
    });
    const risers = [...new Set([...Object.keys(byStatus.Competition), ...Object.keys(byStatus.Practice)])];
    return risers
      .filter(r => (byStatus.Competition[r]?.count || 0) >= 5 && (byStatus.Practice[r]?.count || 0) >= 5)
      .map(r => ({
        name: r.length > 16 ? r.slice(0, 14) + "…" : r,
        comp: Math.round(byStatus.Competition[r].total / byStatus.Competition[r].count),
        practice: Math.round(byStatus.Practice[r].total / byStatus.Practice[r].count),
        compConsistency: Math.max(0, Math.round(100 - byStatus.Competition[r].stddev / byStatus.Competition[r].count)),
        practiceConsistency: Math.max(0, Math.round(100 - byStatus.Practice[r].stddev / byStatus.Practice[r].count)),
      }))
      .sort((a, b) => b.comp - a.comp)
      .slice(0, 10);
  }, [filtered.equip]);

  const pressurePerformers = useMemo(() => {
    return compVsPractice
      .filter(r => r.comp >= r.practice)
      .sort((a, b) => (b.comp - b.practice) - (a.comp - a.practice));
  }, [compVsPractice]);

  return (
    <div className="flex flex-col gap-6">
      {compVsPractice.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-sm font-medium">Not enough competition data yet</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Requires equipment with at least 5 rounds each in competition and practice.
          </p>
        </div>
      ) : (
        <>
          {/* Pressure performers callout */}
          {pressurePerformers.length > 0 && (
            <div className="card" style={{ borderLeft: "3px solid var(--success)" }}>
              <h3 className="text-sm font-semibold mb-1">Pressure performers</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                Equipment that scores HIGHER in competition than practice — holds up under pressure.
              </p>
              <div className="flex gap-2 flex-wrap">
                {pressurePerformers.map(p => (
                  <span key={p.name} className="text-xs font-semibold py-1 px-3 rounded-full"
                    style={{ background: "var(--success-light)", color: "var(--success-text)" }}>
                    {p.name} (+{p.comp - p.practice})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Competition vs Practice */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-1">Competition vs practice scores</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
              Side-by-side comparison of average scores in competition vs practice rounds.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compVsPractice} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} width={130} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="comp" name="Competition" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                <Bar dataKey="practice" name="Practice" fill={COLORS[1]} radius={[0, 4, 4, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded" style={{ background: COLORS[0] }} /> Competition</span>
              <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded" style={{ background: COLORS[1], opacity: 0.5 }} /> Practice</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
