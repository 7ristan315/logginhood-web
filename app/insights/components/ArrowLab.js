"use client";

import { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import ZoneTargetPie from "./ZoneTargetPie";

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)","var(--chart-6)","var(--chart-7)","var(--chart-8)","var(--chart-9)","var(--chart-10)"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function ArrowLab({ arrowPerf, filtered, zoneDist }) {
  const scatterData = useMemo(() => {
    const byArrow = {};
    (filtered.arrows || []).forEach(r => {
      const key = r.arrow_name || "Unknown";
      if (!byArrow[key]) byArrow[key] = { name: key, total: 0, count: 0, stddevs: [], samples: 0 };
      byArrow[key].total += r.avg_score * r.sample_size;
      byArrow[key].count += r.sample_size;
      byArrow[key].stddevs.push(r.score_stddev);
      byArrow[key].samples += r.sample_size;
    });
    return Object.values(byArrow)
      .filter(a => a.samples >= 10)
      .map(a => ({
        name: a.name,
        avg: Math.round(a.total / a.count),
        consistency: Math.round(100 - median(a.stddevs)),
        samples: a.samples,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 15);
  }, [filtered.arrows]);

  const rankings = useMemo(() => [...scatterData].sort((a, b) => b.avg - a.avg), [scatterData]);

  const spineAnalysis = useMemo(() => {
    const bySpine = {};
    (filtered.arrows || []).forEach(r => {
      const spine = r.spine || "Unknown";
      if (spine === "Unknown") return;
      if (!bySpine[spine]) bySpine[spine] = { spine, total: 0, count: 0 };
      bySpine[spine].total += r.avg_score * r.sample_size;
      bySpine[spine].count += r.sample_size;
    });
    return Object.values(bySpine)
      .filter(s => s.count >= 5)
      .map(s => ({ name: s.spine, avg: Math.round(s.total / s.count), n: s.count }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name))
      .slice(0, 10);
  }, [filtered.arrows]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid-responsive-2" style={{ gap: 16 }}>
        {/* Scatter */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Performance vs consistency</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
            Top-right = high score AND consistent. Each dot is an arrow model.
          </p>
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="avg" name="Avg score" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  label={{ value: "Avg score →", position: "insideBottom", offset: -5, fontSize: 10, fill: "var(--text-tertiary)" }} />
                <YAxis dataKey="consistency" name="Consistency" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  label={{ value: "Consistency →", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--text-tertiary)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Scatter data={scatterData}>
                  {scatterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: "var(--text-tertiary)" }}>No arrow data available</div>
          )}
        </div>

        {/* Rankings */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Arrow rankings</h3>
          {rankings.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rankings} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="avg" name="Avg score" radius={[0, 6, 6, 0]}>
                  {rankings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: "var(--text-tertiary)" }}>No arrow data</div>
          )}
        </div>
      </div>

      {/* Spine analysis */}
      {spineAnalysis.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Spine analysis</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>Average score by arrow spine value</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spineAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avg" name="Avg score" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Zone target face */}
      <ZoneTargetPie zoneDist={zoneDist} />

      {/* Detail table */}
      {(filtered.arrows || []).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Arrow performance detail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Arrow", "Spine", "Length", "Points", "Bow", "Avg", "StdDev", "n"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filtered.arrows || []).slice(0, 30).map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="py-2 px-3 font-medium">{r.arrow_name}</td>
                    <td className="py-2 px-3">{r.spine || "—"}</td>
                    <td className="py-2 px-3">{r.arrow_length || "—"}</td>
                    <td className="py-2 px-3">{r.point_weight || "—"}</td>
                    <td className="py-2 px-3">{r.bow_type}</td>
                    <td className="py-2 px-3 font-bold" style={{ color: "var(--accent)" }}>{r.avg_score}</td>
                    <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{r.score_stddev}</td>
                    <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{r.sample_size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
