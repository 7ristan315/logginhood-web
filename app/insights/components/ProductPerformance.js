"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter } from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

function ProductSearch({ label, value, onChange, catalog, category }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const items = useMemo(() => {
    const q = query.toLowerCase();
    return catalog.filter(c => c.category === category && (!q || `${c.brand} ${c.model}`.toLowerCase().includes(q))).slice(0, 20);
  }, [catalog, category, query]);

  function handleFocus() {
    setOpen(true);
    setQuery("");
  }

  function handleSelect(item) {
    const val = `${item.brand} ${item.model}`;
    onChange(val);
    setQuery(val);
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-tertiary)" }}>{label}</label>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={handleFocus}
        placeholder="Search brand or model…"
        className="w-full py-2 px-3 text-sm rounded-lg border"
        style={{ background: "var(--surface-1)", borderColor: value ? "var(--accent)" : "var(--border)", color: "var(--text-primary)" }}
      />
      {open && items.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border overflow-hidden max-h-60 overflow-y-auto"
          style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>
          {items.map((item, i) => (
            <button key={`${item.brand}-${item.model}-${i}`}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2 text-sm border-none cursor-pointer"
              style={{ background: "transparent", color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)" }}
              onMouseEnter={e => e.target.style.background = "var(--surface-2)"}
              onMouseLeave={e => e.target.style.background = "transparent"}>
              <span className="font-medium">{item.brand}</span> <span style={{ color: "var(--text-secondary)" }}>{item.model}</span>
            </button>
          ))}
        </div>
      )}
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  );
}

function ProductScorecard({ name, data }) {
  if (!data.length) return (
    <div className="card flex items-center justify-center py-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
      No data for "{name}"
    </div>
  );

  const totalSamples = data.reduce((s, r) => s + r.sample_size, 0);
  const weightedAvg = Math.round(data.reduce((s, r) => s + r.avg_score * r.sample_size, 0) / totalSamples);
  const avgStddev = Math.round(data.reduce((s, r) => s + (r.score_stddev || 0) * r.sample_size, 0) / totalSamples);
  const avgGolds = Math.round(data.reduce((s, r) => s + (r.avg_golds || 0) * r.sample_size, 0) / totalSamples * 10) / 10;
  const consistency = Math.max(0, 100 - avgStddev);

  const byRound = {};
  data.forEach(r => {
    if (!byRound[r.round_name]) byRound[r.round_name] = { round: r.round_name, total: 0, count: 0 };
    byRound[r.round_name].total += r.avg_score * r.sample_size;
    byRound[r.round_name].count += r.sample_size;
  });
  const roundData = Object.values(byRound).map(r => ({ name: r.round, avg: Math.round(r.total / r.count), n: r.count })).sort((a, b) => b.avg - a.avg).slice(0, 6);

  const byBracket = {};
  data.forEach(r => {
    const bracket = r.age_category || "Unknown";
    if (!byBracket[bracket]) byBracket[bracket] = 0;
    byBracket[bracket] += r.sample_size;
  });
  const demographics = Object.entries(byBracket).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: "var(--accent-light)" }}>⚡</div>
        <div>
          <h4 className="font-semibold text-sm">{name}</h4>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{totalSamples} rounds tracked</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Avg score", value: weightedAvg, color: "var(--chart-1)" },
          { label: "Consistency", value: `${consistency}%`, color: consistency > 75 ? "var(--success)" : "var(--warning)" },
          { label: "Avg golds", value: avgGolds, color: "var(--chart-3)" },
          { label: "Sample size", value: totalSamples, color: "var(--text-secondary)" },
        ].map(m => (
          <div key={m.label} className="text-center">
            <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Performance by round */}
      {roundData.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>By round</h5>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={roundData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {roundData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Demographics */}
      {demographics.length > 1 && (
        <div>
          <h5 className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>Archer demographics</h5>
          <div className="flex gap-2 flex-wrap">
            {demographics.map(d => (
              <span key={d.name} className="text-xs py-1 px-2.5 rounded-full" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                {d.name}: {d.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductPerformance({ equipPerf, catalog, filters }) {
  const [productA, setProductA] = useState("");
  const [productB, setProductB] = useState("");
  const [category, setCategory] = useState("riser");

  const fieldMap = { riser: "riser", limbs: "limbs", sight: "sight_name", arrow: "arrow_name" };

  function matchProduct(row, product) {
    if (!product) return false;
    const q = product.toLowerCase();
    const field = fieldMap[category];
    return (row[field] || "").toLowerCase().includes(q);
  }

  const dataA = useMemo(() => equipPerf.filter(r => matchProduct(r, productA)), [equipPerf, productA, category]);
  const dataB = useMemo(() => equipPerf.filter(r => matchProduct(r, productB)), [equipPerf, productB, category]);

  const comparisonData = useMemo(() => {
    if (!dataA.length || !dataB.length) return [];
    const aAvg = Math.round(dataA.reduce((s, r) => s + r.avg_score * r.sample_size, 0) / dataA.reduce((s, r) => s + r.sample_size, 0));
    const bAvg = Math.round(dataB.reduce((s, r) => s + r.avg_score * r.sample_size, 0) / dataB.reduce((s, r) => s + r.sample_size, 0));
    const aStd = Math.round(dataA.reduce((s, r) => s + (r.score_stddev || 0) * r.sample_size, 0) / dataA.reduce((s, r) => s + r.sample_size, 0));
    const bStd = Math.round(dataB.reduce((s, r) => s + (r.score_stddev || 0) * r.sample_size, 0) / dataB.reduce((s, r) => s + r.sample_size, 0));
    const aGolds = Math.round(dataA.reduce((s, r) => s + (r.avg_golds || 0) * r.sample_size, 0) / dataA.reduce((s, r) => s + r.sample_size, 0) * 10) / 10;
    const bGolds = Math.round(dataB.reduce((s, r) => s + (r.avg_golds || 0) * r.sample_size, 0) / dataB.reduce((s, r) => s + r.sample_size, 0) * 10) / 10;
    return [
      { metric: "Avg score", A: aAvg, B: bAvg },
      { metric: "Consistency", A: 100 - aStd, B: 100 - bStd },
      { metric: "Avg golds", A: aGolds, B: bGolds },
      { metric: "Sample size", A: dataA.reduce((s, r) => s + r.sample_size, 0), B: dataB.reduce((s, r) => s + r.sample_size, 0) },
    ];
  }, [dataA, dataB]);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h3 className="text-base font-semibold mb-1">Product comparison</h3>
        <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
          Select two products to compare head-to-head across performance metrics.
        </p>

        {/* Category selector */}
        <div className="flex gap-2 mb-4">
          {[{ id: "riser", label: "Risers" }, { id: "limbs", label: "Limbs" }, { id: "sight", label: "Sights" }].map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className="text-xs py-1.5 px-3 rounded-full border-none cursor-pointer font-medium"
              style={{ background: category === c.id ? "var(--accent)" : "var(--surface-3)", color: category === c.id ? "var(--accent-foreground)" : "var(--text-secondary)" }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Product pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProductSearch label="Product A" value={productA} onChange={setProductA} catalog={catalog} category={category} />
          <ProductSearch label="Product B" value={productB} onChange={setProductB} catalog={catalog} category={category} />
        </div>
      </div>

      {/* Comparison chart */}
      {comparisonData.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-semibold mb-4">Head-to-head</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>Metric</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: COLORS[0], borderBottom: "1px solid var(--border)" }}>{productA || "Product A"}</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: COLORS[1], borderBottom: "1px solid var(--border)" }}>{productB || "Product B"}</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>Diff</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(row => {
                  const diff = Math.round((row.A - row.B) * 10) / 10;
                  return (
                    <tr key={row.metric} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="py-2.5 px-3 font-medium">{row.metric}</td>
                      <td className="py-2.5 px-3 text-right font-bold" style={{ color: row.A >= row.B ? "var(--success)" : "var(--text-primary)" }}>{Math.round(row.A * 10) / 10}</td>
                      <td className="py-2.5 px-3 text-right font-bold" style={{ color: row.B >= row.A ? "var(--success)" : "var(--text-primary)" }}>{Math.round(row.B * 10) / 10}</td>
                      <td className="py-2.5 px-3 text-right text-xs font-semibold" style={{ color: diff > 0 ? "var(--success)" : diff < 0 ? "var(--danger)" : "var(--text-tertiary)" }}>
                        {diff > 0 ? "+" : ""}{diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual scorecards */}
      <div className="grid-responsive-2" style={{ gap: 16 }}>
        {productA && <ProductScorecard name={productA} data={dataA} />}
        {productB && <ProductScorecard name={productB} data={dataB} />}
      </div>

      {!productA && !productB && (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">⚡</span>
          <p className="text-sm font-medium">Select products above to compare</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Search by brand or model name to see detailed performance data and head-to-head comparisons.
          </p>
        </div>
      )}
    </div>
  );
}
