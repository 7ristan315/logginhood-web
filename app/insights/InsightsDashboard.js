"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Area, ReferenceLine,
} from "recharts";

// ── Colour palette ──
const COLORS = ["#1A9B6B","#2563EB","#D97706","#DC2626","#7C3AED","#059669","#E85D75","#0891B2","#CA8A04","#6366F1"];
const BOW_COLORS = { Recurve: "#2563EB", Compound: "#DC2626", Barebow: "#1A9B6B", Longbow: "#D97706" };

// ── Statistical helpers ──
function wilsonScore(pos, n, z = 1.96) {
  if (n === 0) return 0;
  const phat = pos / n;
  return (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n)) / (1+z*z/n);
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a,b) => a-b);
  const idx = (p/100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const frac = idx - lower;
  return sorted[lower] + (sorted[lower+1] !== undefined ? frac * (sorted[lower+1] - sorted[lower]) : 0);
}

function median(arr) { return percentile(arr, 50); }

// ── Components ──
const TABS = ["Overview","EPI Rankings","Setup DNA","Arrow Analysis","Market Share","Score Distribution","Methodology"];

function StatCard({ value, label, sub, colour, large }) {
  return (
    <div style={{ padding: large ? "24px 28px" : "16px 20px", borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
      {colour && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: colour }} />}
      <div style={{ fontSize: large ? 36 : 28, fontWeight: 800, color: colour || "var(--accent)", lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: large ? 15 : 13, fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, methodology }) {
  const [showMethod, setShowMethod] = useState(false);
  return (
    <div style={{ borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {methodology && (
          <button onClick={() => setShowMethod(!showMethod)} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--foreground)", opacity: 0.5 }}>
            {showMethod ? "Hide" : "Method"}
          </button>
        )}
      </div>
      {showMethod && methodology && (
        <div style={{ padding: "12px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)", fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
          {methodology}
        </div>
      )}
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function FilterPanel({ filters, values, onChange, data }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, alignSelf: "center", marginRight: 4 }}>Filters:</span>
      {filters.map(f => {
        const opts = [...new Set((data || []).map(r => r[f.key]).filter(Boolean))].sort();
        return (
          <select key={f.key} value={values[f.key] || ""} onChange={e => onChange({ ...values, [f.key]: e.target.value })}
            style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
            <option value="">{f.label}: All</option>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      })}
      {Object.values(values).some(v => v) && (
        <button onClick={() => onChange({})} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          Clear
        </button>
      )}
    </div>
  );
}

function applyFilters(data, filters) {
  return (data || []).filter(row => {
    for (const [key, val] of Object.entries(filters)) {
      if (val && String(row[key]) !== val) return false;
    }
    return true;
  });
}

const tooltipStyle = { backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

// ── Main Dashboard ──
export default function InsightsDashboard({ stats, equipPerf, setupDna, arrowPerf, marketShare, journey }) {
  const [tab, setTab] = useState("Overview");
  const [filters, setFilters] = useState({});

  // ── Derived data ──
  const epiData = useMemo(() => {
    const filtered = applyFilters(equipPerf, filters);
    const bySight = {};
    filtered.forEach(r => {
      const key = r.sight_name || "Unknown";
      if (!bySight[key]) bySight[key] = { name: key, scores: [], samples: 0 };
      bySight[key].scores.push(r.avg_score);
      bySight[key].samples += r.sample_size;
    });
    return Object.values(bySight)
      .filter(s => s.samples >= 10)
      .map(s => ({
        name: s.name,
        epi: Math.round(wilsonScore(s.scores.reduce((a,b) => a+b, 0) / s.scores.length / 600, 1) * 100),
        avg: Math.round(s.scores.reduce((a,b) => a+b, 0) / s.scores.length),
        samples: s.samples,
      }))
      .sort((a, b) => b.epi - a.epi)
      .slice(0, 15);
  }, [equipPerf, filters]);

  const riserEpi = useMemo(() => {
    const filtered = applyFilters(equipPerf, filters);
    const byRiser = {};
    filtered.forEach(r => {
      const key = r.riser || "Unknown";
      if (!byRiser[key]) byRiser[key] = { name: key, total: 0, count: 0, samples: 0 };
      byRiser[key].total += r.avg_score * r.sample_size;
      byRiser[key].count += r.sample_size;
      byRiser[key].samples += r.sample_size;
    });
    return Object.values(byRiser)
      .filter(r => r.samples >= 15)
      .map(r => ({ name: r.name.length > 20 ? r.name.slice(0,18)+"…" : r.name, avg: Math.round(r.total / r.count), samples: r.samples }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 12);
  }, [equipPerf, filters]);

  const marketPie = useMemo(() => {
    const filtered = applyFilters(marketShare, filters);
    const byRiser = {};
    filtered.forEach(r => {
      const key = r.riser || "Other";
      byRiser[key] = (byRiser[key] || 0) + r.archer_count;
    });
    return Object.entries(byRiser)
      .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0,16)+"…" : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [marketShare, filters]);

  const sightPie = useMemo(() => {
    const filtered = applyFilters(marketShare, filters);
    const bySight = {};
    filtered.forEach(r => {
      const key = r.sight_name || "None/Unknown";
      bySight[key] = (bySight[key] || 0) + r.archer_count;
    });
    return Object.entries(bySight)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [marketShare, filters]);

  const dnaChart = useMemo(() => {
    const filtered = applyFilters(setupDna, filters);
    const brackets = ["Under 300", "300-399", "400-449", "450-499", "500-549", "550+"];
    return brackets.map(b => {
      const rows = filtered.filter(r => r.score_bracket === b);
      const total = rows.reduce((s, r) => s + r.archer_count, 0);
      return { bracket: b, archers: total, rounds: rows.reduce((s, r) => s + r.round_count, 0) };
    });
  }, [setupDna, filters]);

  const arrowChart = useMemo(() => {
    const filtered = applyFilters(arrowPerf, filters);
    const byArrow = {};
    filtered.forEach(r => {
      const key = r.arrow_name || "Unknown";
      if (!byArrow[key]) byArrow[key] = { name: key, total: 0, count: 0, stddev: [], samples: 0 };
      byArrow[key].total += r.avg_score * r.sample_size;
      byArrow[key].count += r.sample_size;
      byArrow[key].stddev.push(r.score_stddev);
      byArrow[key].samples += r.sample_size;
    });
    return Object.values(byArrow)
      .filter(a => a.samples >= 10)
      .map(a => ({
        name: a.name,
        avg: Math.round(a.total / a.count),
        consistency: Math.round(100 - median(a.stddev)),
        samples: a.samples,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 12);
  }, [arrowPerf, filters]);

  const bowDistribution = useMemo(() => {
    const filtered = applyFilters(equipPerf, filters);
    const byBow = {};
    filtered.forEach(r => {
      const bt = r.bow_type || "Unknown";
      if (!byBow[bt]) byBow[bt] = [];
      for (let i = 0; i < r.sample_size; i++) byBow[bt].push(r.avg_score);
    });
    return Object.entries(byBow).map(([bow, scores]) => ({
      bow,
      p10: Math.round(percentile(scores, 10)),
      p25: Math.round(percentile(scores, 25)),
      p50: Math.round(median(scores)),
      p75: Math.round(percentile(scores, 75)),
      p90: Math.round(percentile(scores, 90)),
      count: scores.length,
    }));
  }, [equipPerf, filters]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Logginhood Insights</h1>
        <p style={{ fontSize: 14, opacity: 0.5, margin: "4px 0 0" }}>Equipment performance analytics for archery manufacturers</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setFilters({}); }}
            style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: tab === t ? 700 : 400, cursor: "pointer",
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--foreground)",
              border: tab === t ? "none" : "1px solid var(--border)",
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <StatCard value={stats?.total_archers?.toLocaleString()} label="Archers" sub="On platform" colour="#1A9B6B" large />
            <StatCard value={stats?.total_rounds?.toLocaleString()} label="Rounds scored" sub="All time" colour="#2563EB" large />
            <StatCard value={stats?.rounds_with_setup?.toLocaleString()} label="Equipment-linked" sub="Rounds with setup data" colour="#7C3AED" large />
            <StatCard value={stats?.active_archers_30d?.toLocaleString()} label="Active (30d)" sub="Scored this month" colour="#D97706" large />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Riser Market Share" subtitle="By active archer count">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={marketPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} style={{ fontSize: 11 }}>
                    {marketPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Score Distribution by Bow Type" subtitle="Percentile ranges (P10–P90)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bowDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                  <YAxis type="category" dataKey="bow" tick={{ fontSize: 12, fill: "var(--foreground)" }} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="p50" name="Median" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="p75" name="75th %ile" fill="#2563EB" radius={[0, 4, 4, 0]} opacity={0.6} />
                  <Bar dataKey="p90" name="90th %ile" fill="#7C3AED" radius={[0, 4, 4, 0]} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Top Performing Risers" subtitle="Average score across all rounds (min 15 sample)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riserEpi} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)" }} width={160} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [v, name === "avg" ? "Avg Score" : name]} />
                <Bar dataKey="avg" name="Avg Score" fill="var(--accent)" radius={[0, 6, 6, 0]}>
                  {riserEpi.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ═══ EPI RANKINGS ═══ */}
      {tab === "EPI Rankings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FilterPanel filters={[
            { key: "bow_type", label: "Bow" },
            { key: "round_name", label: "Round" },
            { key: "gender", label: "Gender" },
          ]} values={filters} onChange={setFilters} data={equipPerf} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Sight EPI Rankings" subtitle="Wilson score-adjusted performance index"
              methodology="EPI uses the Wilson score interval — a Bayesian method that balances observed performance against sample size. Products with few observations are penalised, preventing small samples from dominating rankings. z=1.96 (95% confidence).">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={epiData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)" }} width={140} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [name === "epi" ? `${v}/100` : v, name === "epi" ? "EPI Score" : "Sample"]} />
                  <Bar dataKey="epi" name="EPI" radius={[0, 6, 6, 0]}>
                    {epiData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Riser Performance" subtitle="Average score by riser model"
              methodology="Simple arithmetic mean of all scores shot with each riser, weighted by sample size. Minimum 15 scores to appear. No handicap adjustment — raw scores only.">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={riserEpi} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)" }} width={160} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="avg" name="Avg Score" fill="#2563EB" radius={[0, 6, 6, 0]}>
                    {riserEpi.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Equipment Performance Detail" subtitle="All equipment combinations meeting threshold">
            <div style={{ overflowX: "auto", maxHeight: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, background: "var(--card)", zIndex: 1 }}>
                    {["Sight","Riser","Limbs","Bow","Round","Avg","StdDev","Golds","n"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(equipPerf, filters).slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 10px", fontWeight: 500 }}>{r.sight_name || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.riser || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.limbs || "—"}</td>
                      <td style={{ padding: "6px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 4, background: `${BOW_COLORS[r.bow_type]}20`, color: BOW_COLORS[r.bow_type], fontSize: 11, fontWeight: 600 }}>{r.bow_type}</span></td>
                      <td style={{ padding: "6px 10px" }}>{r.round_name}</td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{r.avg_score}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.6 }}>{r.score_stddev}</td>
                      <td style={{ padding: "6px 10px" }}>{r.avg_golds}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.5 }}>{r.sample_size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══ SETUP DNA ═══ */}
      {tab === "Setup DNA" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FilterPanel filters={[
            { key: "bow_type", label: "Bow" },
            { key: "round_name", label: "Round" },
            { key: "score_bracket", label: "Level" },
          ]} values={filters} onChange={setFilters} data={setupDna} />

          <ChartCard title="Archer Population by Score Level" subtitle="How many archers at each performance tier"
            methodology="Score brackets divide the population into skill tiers. Each archer is counted once per bracket based on their average score for the filtered round/bow combination.">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dnaChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="archers" name="Archers" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Equipment at Each Level" subtitle="What gear do archers use at different score tiers?">
            <div style={{ overflowX: "auto", maxHeight: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, background: "var(--card)", zIndex: 1 }}>
                    {["Level","Riser","Limbs","Sight","Draw Wt","Avg Score","Archers","Rounds"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(setupDna, filters).slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 10px" }}><span style={{ padding: "2px 8px", borderRadius: 6, background: r.score_bracket === "550+" ? "#1A9B6B20" : "var(--border)", color: r.score_bracket === "550+" ? "#1A9B6B" : "var(--foreground)", fontWeight: 600, fontSize: 11 }}>{r.score_bracket}</span></td>
                      <td style={{ padding: "6px 10px", fontWeight: 500 }}>{r.riser || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.limbs || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.sight_name || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.draw_weight || "—"}</td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{r.avg_score}</td>
                      <td style={{ padding: "6px 10px" }}>{r.archer_count}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.5 }}>{r.round_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══ ARROW ANALYSIS ═══ */}
      {tab === "Arrow Analysis" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FilterPanel filters={[
            { key: "bow_type", label: "Bow" },
            { key: "round_name", label: "Round" },
          ]} values={filters} onChange={setFilters} data={arrowPerf} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Arrow Performance vs Consistency" subtitle="Avg score vs consistency score (100 - stddev)"
              methodology="Each dot is an arrow model. X-axis = average score. Y-axis = consistency (100 minus standard deviation). Top-right quadrant = high performance AND high consistency — the sweet spot.">
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="avg" name="Avg Score" tick={{ fontSize: 11, fill: "var(--foreground)" }} label={{ value: "Avg Score →", position: "insideBottom", offset: -5, fontSize: 11, fill: "var(--foreground)" }} />
                  <YAxis dataKey="consistency" name="Consistency" tick={{ fontSize: 11, fill: "var(--foreground)" }} label={{ value: "Consistency →", angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--foreground)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [v, name]} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={arrowChart} fill="var(--accent)">
                    {arrowChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Arrow Rankings" subtitle="By average score (min 10 samples)">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={arrowChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)" }} width={140} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="avg" name="Avg Score" fill="#D97706" radius={[0, 6, 6, 0]}>
                    {arrowChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Arrow Performance Detail">
            <div style={{ overflowX: "auto", maxHeight: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, background: "var(--card)", zIndex: 1 }}>
                    {["Arrow","Spine","Length","Points","Bow","Round","Avg","StdDev","Archers","Rounds"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(arrowPerf, filters).slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 10px", fontWeight: 600 }}>{r.arrow_name}</td>
                      <td style={{ padding: "6px 10px" }}>{r.spine || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.arrow_length || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.point_weight || "—"}</td>
                      <td style={{ padding: "6px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 4, background: `${BOW_COLORS[r.bow_type]}20`, color: BOW_COLORS[r.bow_type], fontSize: 11, fontWeight: 600 }}>{r.bow_type}</span></td>
                      <td style={{ padding: "6px 10px" }}>{r.round_name}</td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{r.avg_score}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.6 }}>{r.score_stddev}</td>
                      <td style={{ padding: "6px 10px" }}>{r.archer_count}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.5 }}>{r.sample_size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══ MARKET SHARE ═══ */}
      {tab === "Market Share" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FilterPanel filters={[
            { key: "bow_type", label: "Bow" },
          ]} values={filters} onChange={setFilters} data={marketShare} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Riser Market Share" subtitle="By number of active archers">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={marketPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={60} paddingAngle={2} label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent*100).toFixed(0)}%` : ""} style={{ fontSize: 11 }}>
                    {marketPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Sight Market Share" subtitle="By number of active archers">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={sightPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={60} paddingAngle={2} label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent*100).toFixed(0)}%` : ""} style={{ fontSize: 11 }}>
                    {sightPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Full Equipment Breakdown">
            <div style={{ overflowX: "auto", maxHeight: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, background: "var(--card)", zIndex: 1 }}>
                    {["Riser","Limbs","Sight","Button","Draw Wt","Bow","Archers","Rounds"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(marketShare, filters).slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 10px", fontWeight: 500 }}>{r.riser || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.limbs || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.sight_name || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.button_name || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.draw_weight || "—"}</td>
                      <td style={{ padding: "6px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 4, background: `${BOW_COLORS[r.bow_type]}20`, color: BOW_COLORS[r.bow_type], fontSize: 11, fontWeight: 600 }}>{r.bow_type}</span></td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{r.archer_count}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.5 }}>{r.round_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══ SCORE DISTRIBUTION ═══ */}
      {tab === "Score Distribution" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FilterPanel filters={[
            { key: "bow_type", label: "Bow" },
            { key: "round_name", label: "Round" },
          ]} values={filters} onChange={setFilters} data={equipPerf} />

          <ChartCard title="Score Distribution by Bow Type" subtitle="Percentile breakdown: P10, P25, Median, P75, P90"
            methodology="Percentiles show the spread of scores for each bow type. P50 (median) is the typical archer. P90 represents the top 10%. Compound scores highest due to mechanical advantage; longbow lowest as expected from the equipment constraints.">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={bowDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bow" tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area dataKey="p90" name="P90" fill="#7C3AED" fillOpacity={0.15} stroke="none" />
                <Area dataKey="p75" name="P75" fill="#2563EB" fillOpacity={0.2} stroke="none" />
                <Bar dataKey="p50" name="Median" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40} />
                <Line dataKey="p10" name="P10" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Equipment Journey" subtitle="Performance across setup versions">
            <div style={{ overflowX: "auto", maxHeight: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, background: "var(--card)", zIndex: 1 }}>
                    {["Riser","Limbs","Sight","Draw Wt","Version","Round","Avg","StdDev","First","Last","Rounds"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applyFilters(journey, filters).slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 10px", fontWeight: 500 }}>{r.riser || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.limbs || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.sight_name || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{r.draw_weight || "—"}</td>
                      <td style={{ padding: "6px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 4, background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700 }}>v{r.version}</span></td>
                      <td style={{ padding: "6px 10px" }}>{r.round_name}</td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{r.avg_score}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.6 }}>{r.score_stddev}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.5 }}>{r.first_used}</td>
                      <td style={{ padding: "6px 10px", opacity: 0.5 }}>{r.last_used}</td>
                      <td style={{ padding: "6px 10px" }}>{r.round_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══ METHODOLOGY ═══ */}
      {tab === "Methodology" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              title: "Equipment Performance Index (EPI)",
              content: "The EPI uses the Wilson score confidence interval, a Bayesian method originally developed for binomial proportions. We normalise each score against the round maximum, then apply Wilson scoring with z=1.96 (95% confidence). This means a product with 5 scores averaging 90% will rank lower than one with 500 scores averaging 85% — sample size matters. This prevents niche products from gaming the rankings.",
            },
            {
              title: "Score Distribution & Percentiles",
              content: "We compute P10, P25, P50 (median), P75, and P90 percentiles for each equipment grouping. The interquartile range (P25–P75) shows where 50% of archers fall. Wide IQR indicates inconsistent performance; narrow IQR suggests the equipment is predictable. We prefer median over mean to reduce the impact of outliers (e.g., a beginner using elite equipment).",
            },
            {
              title: "Setup DNA Analysis",
              content: "Archers are segmented into score brackets based on their average performance. Within each bracket, we count equipment usage frequency to build a 'typical setup' profile. This reveals the equipment journey — what beginners use vs what competitive archers settle on. Cross-referencing with switching data shows which upgrades correlate with score improvement.",
            },
            {
              title: "Market Share Calculation",
              content: "Market share is counted by unique active archers (not scores) to prevent high-volume shooters from skewing the data. Only currently active setups are counted. A single archer with two bows counts once per bow type.",
            },
            {
              title: "Switching Reports",
              content: "When an archer's setup version changes between consecutive scored rounds of the same type, we flag it as a switching event. The before/after comparison uses a paired analysis — same archer, same round type, different equipment. This controls for archer skill and isolates the equipment variable. Minimum 50 switching events required for statistical reliability.",
            },
            {
              title: "Data Integrity",
              content: "All data is anonymised — no names, emails, or club identifiers are exposed. Minimum sample sizes (5–50 depending on the analysis) prevent de-anonymisation through small-group inference. GDPR compliant. Users consent to anonymised aggregate data use at signup.",
            },
          ].map((item, i) => (
            <ChartCard key={i} title={item.title}>
              <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.8, margin: 0 }}>{item.content}</p>
            </ChartCard>
          ))}
        </div>
      )}
    </div>
  );
}
