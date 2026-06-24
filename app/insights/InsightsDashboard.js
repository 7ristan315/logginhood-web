"use client";

import { useState } from "react";

const TABS = ["Overview", "Equipment Performance", "Setup DNA", "Arrow Analysis", "Market Share", "Equipment Journey"];

function StatCard({ value, label, sub }) {
  return (
    <div style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>{value ?? "—"}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function DataTable({ columns, rows, emptyMsg }) {
  if (!rows.length) return <div style={{ padding: 24, textAlign: "center", opacity: 0.5, fontSize: 14 }}>{emptyMsg || "No data yet — scores need to be linked to bow setups."}</div>;
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--card)" }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: "8px 12px", whiteSpace: "nowrap", ...(c.style?.(row) || {}) }}>
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterBar({ filters, values, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {filters.map(f => (
        <select key={f.key} value={values[f.key] || ""} onChange={e => onChange({ ...values, [f.key]: e.target.value })}
          style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
          <option value="">{f.label}: All</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
    </div>
  );
}

function applyFilters(data, filters) {
  return data.filter(row => {
    for (const [key, val] of Object.entries(filters)) {
      if (val && row[key] !== val) return false;
    }
    return true;
  });
}

function uniqueVals(data, key) {
  return [...new Set(data.map(r => r[key]).filter(Boolean))].sort();
}

export default function InsightsDashboard({ stats, equipPerf, setupDna, arrowPerf, marketShare, journey }) {
  const [tab, setTab] = useState("Overview");
  const [filters, setFilters] = useState({});

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>Logginhood Insights</h1>
        <p style={{ fontSize: 14, opacity: 0.5, margin: 0 }}>Anonymised equipment performance data</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setFilters({}); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: tab === t ? "none" : "1px solid var(--border)", background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "var(--accent-foreground)" : "var(--foreground)", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 600 : 400, whiteSpace: "nowrap" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <StatCard value={stats?.total_archers?.toLocaleString()} label="Total archers" />
            <StatCard value={stats?.total_rounds?.toLocaleString()} label="Total rounds scored" />
            <StatCard value={stats?.rounds_with_setup?.toLocaleString()} label="Rounds with setup data" sub="Linked to equipment" />
            <StatCard value={stats?.total_setups?.toLocaleString()} label="Bow setups" />
            <StatCard value={stats?.active_archers_30d?.toLocaleString()} label="Active (30 days)" />
            <StatCard value={stats?.rounds_30d?.toLocaleString()} label="Rounds (30 days)" />
          </div>
          <div style={{ padding: 16, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, lineHeight: 1.8 }}>
            <strong>Data pipeline status:</strong> Every score saved with an active bow setup is automatically linked. Setup changes are versioned and archived. Equipment switching events are tracked for before/after analysis.
          </div>
        </div>
      )}

      {/* Equipment Performance */}
      {tab === "Equipment Performance" && (() => {
        const filtered = applyFilters(equipPerf, filters);
        return (
          <div>
            <FilterBar
              filters={[
                { key: "bow_type", label: "Bow", options: uniqueVals(equipPerf, "bow_type") },
                { key: "round_name", label: "Round", options: uniqueVals(equipPerf, "round_name") },
              ]}
              values={filters} onChange={setFilters}
            />
            <DataTable
              columns={[
                { key: "sight_name", label: "Sight" },
                { key: "riser", label: "Riser" },
                { key: "limbs", label: "Limbs" },
                { key: "bow_type", label: "Bow" },
                { key: "round_name", label: "Round" },
                { key: "avg_score", label: "Avg Score", style: () => ({ fontWeight: 700, color: "var(--accent)" }) },
                { key: "score_stddev", label: "Std Dev" },
                { key: "avg_golds", label: "Avg Golds" },
                { key: "sample_size", label: "Sample", style: () => ({ opacity: 0.6 }) },
              ]}
              rows={filtered}
            />
          </div>
        );
      })()}

      {/* Setup DNA */}
      {tab === "Setup DNA" && (() => {
        const filtered = applyFilters(setupDna, filters);
        return (
          <div>
            <FilterBar
              filters={[
                { key: "bow_type", label: "Bow", options: uniqueVals(setupDna, "bow_type") },
                { key: "round_name", label: "Round", options: uniqueVals(setupDna, "round_name") },
                { key: "score_bracket", label: "Level", options: uniqueVals(setupDna, "score_bracket") },
              ]}
              values={filters} onChange={setFilters}
            />
            <DataTable
              columns={[
                { key: "score_bracket", label: "Level", style: (r) => ({ fontWeight: 700, color: r.score_bracket === "550+" ? "var(--accent)" : "inherit" }) },
                { key: "riser", label: "Riser" },
                { key: "limbs", label: "Limbs" },
                { key: "sight_name", label: "Sight" },
                { key: "draw_weight", label: "Draw Wt" },
                { key: "avg_score", label: "Avg Score", style: () => ({ fontWeight: 600 }) },
                { key: "archer_count", label: "Archers" },
                { key: "round_count", label: "Rounds" },
              ]}
              rows={filtered}
            />
          </div>
        );
      })()}

      {/* Arrow Analysis */}
      {tab === "Arrow Analysis" && (() => {
        const filtered = applyFilters(arrowPerf, filters);
        return (
          <div>
            <FilterBar
              filters={[
                { key: "bow_type", label: "Bow", options: uniqueVals(arrowPerf, "bow_type") },
                { key: "round_name", label: "Round", options: uniqueVals(arrowPerf, "round_name") },
              ]}
              values={filters} onChange={setFilters}
            />
            <DataTable
              columns={[
                { key: "arrow_name", label: "Arrow", style: () => ({ fontWeight: 600 }) },
                { key: "spine", label: "Spine" },
                { key: "arrow_length", label: "Length" },
                { key: "point_weight", label: "Points" },
                { key: "bow_type", label: "Bow" },
                { key: "round_name", label: "Round" },
                { key: "avg_score", label: "Avg Score", style: () => ({ fontWeight: 700, color: "var(--accent)" }) },
                { key: "score_stddev", label: "Std Dev" },
                { key: "archer_count", label: "Archers" },
                { key: "sample_size", label: "Rounds" },
              ]}
              rows={filtered}
            />
          </div>
        );
      })()}

      {/* Market Share */}
      {tab === "Market Share" && (() => {
        const filtered = applyFilters(marketShare, filters);
        return (
          <div>
            <FilterBar
              filters={[
                { key: "bow_type", label: "Bow", options: uniqueVals(marketShare, "bow_type") },
              ]}
              values={filters} onChange={setFilters}
            />
            <DataTable
              columns={[
                { key: "riser", label: "Riser" },
                { key: "limbs", label: "Limbs" },
                { key: "sight_name", label: "Sight" },
                { key: "button_name", label: "Button" },
                { key: "draw_weight", label: "Draw Wt" },
                { key: "bow_type", label: "Bow" },
                { key: "archer_count", label: "Archers", style: () => ({ fontWeight: 700, color: "var(--accent)" }) },
                { key: "round_count", label: "Rounds" },
              ]}
              rows={filtered}
            />
          </div>
        );
      })()}

      {/* Equipment Journey */}
      {tab === "Equipment Journey" && (() => {
        const filtered = applyFilters(journey, filters);
        return (
          <div>
            <FilterBar
              filters={[
                { key: "bow_type", label: "Bow", options: uniqueVals(journey, "bow_type") },
                { key: "round_name", label: "Round", options: uniqueVals(journey, "round_name") },
              ]}
              values={filters} onChange={setFilters}
            />
            <DataTable
              columns={[
                { key: "riser", label: "Riser" },
                { key: "limbs", label: "Limbs" },
                { key: "sight_name", label: "Sight" },
                { key: "draw_weight", label: "Draw Wt" },
                { key: "version", label: "Version" },
                { key: "round_name", label: "Round" },
                { key: "avg_score", label: "Avg Score", style: () => ({ fontWeight: 700, color: "var(--accent)" }) },
                { key: "score_stddev", label: "Std Dev" },
                { key: "first_used", label: "First Used" },
                { key: "last_used", label: "Last Used" },
                { key: "round_count", label: "Rounds" },
              ]}
              rows={filtered}
            />
          </div>
        );
      })()}
    </div>
  );
}
