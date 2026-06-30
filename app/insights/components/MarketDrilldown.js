"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2f6f4f", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#e85d75", "#059669", "#ca8a04", "#6366f1", "#475569", "#c026d3"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

const RAD = Math.PI / 180;
// % inside the slice (white with a dark outline so it reads on any colour); tiny slices
// fall back to an outside "name %" label so they don't get squashed against the ring.
function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.03) return null;
  const pct = Math.round(percent * 100);
  if (percent >= 0.06) {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text x={x} y={y} fill="#fff" stroke="rgba(0,0,0,0.5)" strokeWidth={2.6} paintOrder="stroke"
        textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{pct}%</text>
    );
  }
  const r = outerRadius + 12;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="var(--text-secondary)" textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central" fontSize={11}>{`${name} ${pct}%`}</text>
  );
}

export default function MarketDrilldown({ marketShare, equipPerf }) {
  const [category, setCategory] = useState("riser");
  const [drillPath, setDrillPath] = useState([]);

  const categories = [
    { key: "riser", label: "Risers" },
    { key: "limbs", label: "Limbs" },
    { key: "sight_name", label: "Sights" },
    { key: "button_name", label: "Buttons" },
  ];

  const currentField = categories.find(c => c.key === category)?.key || "riser";

  const chartData = useMemo(() => {
    let source = marketShare || [];

    if (drillPath.length === 0) {
      const byBrand = {};
      source.forEach(r => {
        const val = r[currentField];
        if (!val) return;
        const brand = val.split(" ")[0];
        if (!byBrand[brand]) byBrand[brand] = { name: brand, archers: 0, rounds: 0, products: new Set() };
        byBrand[brand].archers += r.archer_count || 0;
        byBrand[brand].rounds += r.round_count || 0;
        byBrand[brand].products.add(val);
      });
      return Object.values(byBrand)
        .map(b => ({ name: b.name, value: b.archers, rounds: b.rounds, products: b.products.size }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
    }

    if (drillPath.length === 1) {
      const brand = drillPath[0];
      const byProduct = {};
      source.forEach(r => {
        const val = r[currentField];
        if (!val || !val.startsWith(brand)) return;
        if (!byProduct[val]) byProduct[val] = { name: val, archers: 0, rounds: 0 };
        byProduct[val].archers += r.archer_count || 0;
        byProduct[val].rounds += r.round_count || 0;
      });
      return Object.values(byProduct)
        .map(p => ({ name: p.name.length > 25 ? p.name.slice(0, 23) + "…" : p.name, fullName: p.name, value: p.archers, rounds: p.rounds }))
        .sort((a, b) => b.value - a.value);
    }

    if (drillPath.length === 2) {
      const product = drillPath[1];
      const perfData = (equipPerf || []).filter(r => r[currentField] === product);
      const byRound = {};
      perfData.forEach(r => {
        if (!byRound[r.round_name]) byRound[r.round_name] = { name: r.round_name, total: 0, count: 0, stddev: 0 };
        byRound[r.round_name].total += r.avg_score * r.sample_size;
        byRound[r.round_name].count += r.sample_size;
        byRound[r.round_name].stddev += (r.score_stddev || 0) * r.sample_size;
      });
      return Object.values(byRound)
        .map(r => ({
          name: r.name,
          avg: Math.round(r.total / r.count),
          consistency: Math.max(0, Math.round(100 - r.stddev / r.count)),
          samples: r.count,
        }))
        .sort((a, b) => b.avg - a.avg);
    }

    return [];
  }, [marketShare, equipPerf, currentField, drillPath]);

  const totalArchers = chartData.reduce((s, d) => s + (d.value || 0), 0);

  function drill(name) {
    if (drillPath.length < 2) {
      const fullName = chartData.find(d => d.name === name)?.fullName || name;
      setDrillPath([...drillPath, fullName]);
    }
  }

  function navigateUp(level) {
    setDrillPath(drillPath.slice(0, level));
  }

  const levelLabels = ["All brands", drillPath[0] ? `${drillPath[0]} products` : "", drillPath[1] ? `${drillPath[1]} performance` : ""];

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Market share drill-down</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Click any segment to drill deeper. Brand → Products → Performance by round.
          </p>
        </div>
        <div className="flex gap-1.5">
          {categories.map(c => (
            <button key={c.key} onClick={() => { setCategory(c.key); setDrillPath([]); }}
              className="text-xs py-1 px-2.5 rounded-full border-none cursor-pointer font-medium"
              style={{ background: category === c.key ? "var(--accent)" : "var(--surface-3)", color: category === c.key ? "var(--accent-foreground)" : "var(--text-secondary)" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      {drillPath.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs mb-4 flex-wrap">
          <button onClick={() => navigateUp(0)} className="font-medium cursor-pointer border-none bg-transparent"
            style={{ color: "var(--accent)" }}>All brands</button>
          {drillPath.map((p, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span style={{ color: "var(--text-tertiary)" }}>›</span>
              {i < drillPath.length - 1 ? (
                <button onClick={() => navigateUp(i + 1)} className="font-medium cursor-pointer border-none bg-transparent"
                  style={{ color: "var(--accent)" }}>{p}</button>
              ) : (
                <span className="font-semibold">{p}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Charts */}
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm" style={{ color: "var(--text-tertiary)" }}>No data at this level</div>
      ) : drillPath.length <= 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie */}
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={48}
                  paddingAngle={1} style={{ cursor: "pointer" }}
                  onClick={(_, i) => drill(chartData[i]?.name)}
                  label={renderSliceLabel} labelLine={false}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ cursor: "pointer" }} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [`${v} archers (${totalArchers > 0 ? Math.round(v / totalArchers * 100) : 0}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{totalArchers} total archers · click to drill down</p>
          </div>

          {/* Bar */}
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" onClick={(e) => { if (e?.activeLabel) drill(e.activeLabel); }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)", cursor: "pointer" }} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Archers" radius={[0, 6, 6, 0]} cursor="pointer">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Level 3: Performance breakdown */
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Round", "Avg score", "Consistency", "Samples"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.map((r, i) => (
                  <tr key={r.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="py-2 px-3 font-medium">{r.name}</td>
                    <td className="py-2 px-3 font-bold" style={{ color: "var(--accent)" }}>{r.avg}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 60, height: 6, borderRadius: 3, background: "var(--surface-3)", overflow: "hidden" }}>
                          <div style={{ width: `${r.consistency}%`, height: "100%", borderRadius: 3, background: r.consistency > 75 ? "var(--success)" : r.consistency > 50 ? "var(--warning)" : "var(--danger)" }} />
                        </div>
                        <span className="text-xs">{r.consistency}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{r.samples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ResponsiveContainer width="100%" height={200} className="mt-4">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avg" name="Avg score" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick stats at bottom */}
      {drillPath.length <= 1 && chartData.length > 0 && (
        <div className="flex gap-3 flex-wrap mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          {chartData.slice(0, 5).map((d, i) => (
            <button key={d.name} onClick={() => drill(d.name)}
              className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg cursor-pointer border-none"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="font-medium">{d.name}</span>
              <span style={{ color: "var(--text-tertiary)" }}>{totalArchers > 0 ? Math.round(d.value / totalArchers * 100) : 0}%</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
