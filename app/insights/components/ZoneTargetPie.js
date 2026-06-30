"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { renderSliceLabel } from "./pieLabel";

// Target face colours matching the app's RNG map
const ZONE_COLOR = {
  X: "#c8a000", "10": "#c8a000", "9": "#d4af00",
  "8": "#e8394a", "7": "#e8394a",
  "6": "#1a6bbf", "5": "#1a6bbf",
  "4": "#333", "3": "#444",
  "2": "#aaa", "1": "#ccc",
  M: "#4caf50",
};

// Band grouping: collapsed view
const BANDS = [
  { label: "Gold (X/10/9)", zones: ["X","10","9"], color: "#c8a000" },
  { label: "Red (8/7)",     zones: ["8","7"],       color: "#e8394a" },
  { label: "Blue (6/5)",    zones: ["6","5"],        color: "#1a6bbf" },
  { label: "Black (4/3)",   zones: ["4","3"],        color: "#333"    },
  { label: "White (2/1)",   zones: ["2","1"],        color: "#aaa"    },
  { label: "Miss",          zones: ["M"],            color: "#4caf50" },
];

const ZONE_ORDER = ["X","10","9","8","7","6","5","4","3","2","1","M"];

const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

export default function ZoneTargetPie({ zoneDist, filters = {} }) {
  const [bowFilter, setBowFilter] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [byBand, setByBand] = useState(true);

  const bowTypes = useMemo(() => [...new Set((zoneDist || []).map(r => r.bow_type).filter(Boolean))].sort(), [zoneDist]);
  const rounds   = useMemo(() => [...new Set((zoneDist || []).map(r => r.round_name).filter(Boolean))].sort(), [zoneDist]);

  const totals = useMemo(() => {
    const rows = (zoneDist || []).filter(r =>
      (!bowFilter || r.bow_type === bowFilter) &&
      (!roundFilter || r.round_name === roundFilter)
    );
    const acc = {};
    rows.forEach(r => { acc[r.zone] = (acc[r.zone] || 0) + r.arrow_count; });
    return acc;
  }, [zoneDist, bowFilter, roundFilter]);

  const pieData = useMemo(() => {
    if (byBand) {
      return BANDS
        .map(b => ({ name: b.label, value: b.zones.reduce((s, z) => s + (totals[z] || 0), 0), color: b.color }))
        .filter(d => d.value > 0);
    }
    return ZONE_ORDER
      .map(z => ({ name: z, value: totals[z] || 0, color: ZONE_COLOR[z] }))
      .filter(d => d.value > 0);
  }, [totals, byBand]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  if (!zoneDist?.length) return null;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Zone distribution — target face</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Arrow distribution across scoring zones. Slice size = proportion of arrows in that zone.
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <select value={bowFilter} onChange={e => setBowFilter(e.target.value)}
            className="text-xs py-1 px-2 rounded-lg border"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
            <option value="">All bow types</option>
            {bowTypes.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={roundFilter} onChange={e => setRoundFilter(e.target.value)}
            className="text-xs py-1 px-2 rounded-lg border"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
            <option value="">All rounds</option>
            {rounds.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={() => setByBand(!byBand)}
            className="text-xs py-1 px-2.5 rounded-full border-none cursor-pointer font-medium"
            style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
            {byBand ? "Individual zones" : "By colour band"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name"
              cx="50%" cy="50%" outerRadius={120} innerRadius={55}
              paddingAngle={1} label={renderSliceLabel} labelLine={false}>
              {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle}
              formatter={(v, name) => [`${v.toLocaleString()} arrows (${total > 0 ? Math.round(v / total * 100) : 0}%)`, name]} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend / breakdown table */}
        <div className="flex flex-col gap-1.5">
          {pieData.map(d => (
            <div key={d.name} className="flex items-center gap-2.5 text-sm">
              <span className="flex-shrink-0 w-3 h-3 rounded-sm" style={{ background: d.color }} />
              <span className="flex-1 font-medium">{d.name}</span>
              <span style={{ color: "var(--text-tertiary)" }}>{d.value.toLocaleString()}</span>
              <span className="w-10 text-right font-semibold" style={{ color: "var(--accent)" }}>
                {total > 0 ? Math.round(d.value / total * 100) : 0}%
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2.5 text-xs mt-2 pt-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-tertiary)" }}>
            <span className="flex-1">Total arrows</span>
            <span className="font-semibold">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
