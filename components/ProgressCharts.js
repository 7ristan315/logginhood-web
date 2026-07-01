"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { ROUNDS, normPct, stdDev } from "@/lib/rounds";

// arrow-value + zone-colour maps (mirrors the app + ScoreDetail)
const VAL = { X: 10, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2, "1": 1, M: 0, "5z5": 5, "5z4": 4, "5z3": 3, "5z2": 2, "5z1": 1 };
const RNG = {
  X: "#c8a000", "10": "#c8a000", "9": "#c8a000", "8": "#e8394a", "7": "#e8394a",
  "6": "#1a6bbf", "5": "#1a6bbf", "4": "#444", "3": "#444", "2": "#888", "1": "#888", M: "#4caf50",
  "5z5": "#c8a000", "5z4": "#e8394a", "5z3": "#1a6bbf", "5z2": "#444", "5z1": "#888",
};
const PROG_COLORS = ["#1a6bbf", "#e65100", "#2e7d32", "#6a1b9a", "#c2185b"];
const PROG_DASHES = [undefined, "5 3", "2 3", "8 3 2 3", "4 2"];

function linReg(ys) {
  if (ys.length < 2) return null;
  const n = ys.length, xs = ys.map((_, i) => i);
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  if (!den) return null;
  const slope = num / den;
  return { slope, intercept: my - slope * mx };
}
const zonesFor = (sc) => (sc === "5z" ? ["5z5", "5z4", "5z3", "5z2", "5z1", "M"] : ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"]);
const zoneLabel = (z) => (z.startsWith("5z") ? z.slice(2) : z);
const arrowCount = (ends) => (ends || []).reduce((n, e) => n + (e.arrows || []).filter((a) => a != null && a !== "").length, 0);

const TABS = [
  ["progress", "Progress"], ["zones", "Zones"], ["averages", "Averages"],
  ["velocity", "Velocity"], ["golds", "Golds"], ["activity", "Activity"], ["stats", "Stats"],
];

function TargetFaceSVG({ bars, total }) {
  const S = 660, c = 330, R = 300;
  const active = bars.filter(b => b.count > 0).map(b => ({ z: b.zone, display: b.label, color: RNG[b.zone] || "#4caf50", count: b.count }));
  if (!active.length) return null;
  const tot = total || active.reduce((s, r) => s + r.count, 0);
  let cum = 0;
  const rings = active.map(r => { const p = r.count / tot, iR = R * cum; cum += p; const oR = R * cum; return { ...r, pct: Math.round(p * 100), iR, oR, mR: (iR + oR) / 2 }; });
  const ts = { textAnchor: "middle", dominantBaseline: "central", fill: "#fff", stroke: "rgba(0,0,0,0.55)", strokeWidth: 3, paintOrder: "stroke", fontWeight: 700 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${S} ${S}`} style={{ width: "min(100%, 640px)", height: "auto", aspectRatio: "1 / 1", flexShrink: 0, filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.3))" }}>
        {[...rings].reverse().map(r => <circle key={r.z} cx={c} cy={c} r={r.oR} fill={r.color} />)}
        {rings.slice(0, -1).map(r => <circle key={"s" + r.z} cx={c} cy={c} r={r.oR} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />)}
        <circle cx={c} cy={c} r={R} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={1.5} />
        {rings.map((r, i) => {
          const w = r.oR - r.iR, fs = Math.max(12, Math.min(26, w * 0.4));
          if (i === 0) return (
            <g key={"l" + r.z}>
              <text {...ts} x={c} y={c - fs * 0.55} fontSize={fs}>{r.display}</text>
              <text {...ts} x={c} y={c + fs * 0.6} fontSize={fs * 0.8} fontWeight={600}>{r.pct}%</text>
            </g>
          );
          if (w < R * 0.04) return null;
          const two = w >= R * 0.075, y = c - r.mR;
          return <g key={"l" + r.z}>
            {two && <text {...ts} x={c} y={y - fs * 0.55} fontSize={fs}>{r.display}</text>}
            <text {...ts} x={c} y={two ? y + fs * 0.6 : y} fontSize={two ? fs * 0.8 : fs} fontWeight={two ? 600 : 700}>{r.pct}%</text>
          </g>;
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, minWidth: 110 }}>
        {rings.map(r => (
          <div key={r.z} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: r.color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.1)" }} />
            <span style={{ fontWeight: 700, minWidth: 24, color: "var(--text-primary)" }}>{r.display}</span>
            <span style={{ color: "var(--text-tertiary)", flex: 1, textAlign: "right" }}>{r.count}</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", minWidth: 32, textAlign: "right" }}>{r.pct}%</span>
          </div>
        ))}
        <div style={{ marginTop: 2, paddingTop: 4, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--text-tertiary)" }}>
          <span style={{ flex: 1 }}>Total</span>
          <span style={{ fontWeight: 600 }}>{tot}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProgressCharts({ scores }) {
  const allRounds = useMemo(() => [...new Set(scores.map((s) => s.round_name))].sort(), [scores]);
  const lastRound = useMemo(() => {
    const s = scores.slice().sort((a, b) => new Date(b.shot_at) - new Date(a.shot_at))[0];
    return s?.round_name ?? allRounds[0] ?? "";
  }, [scores, allRounds]);

  const [sub, setSub] = useState("progress");
  const [activeRounds, setActiveRounds] = useState(() => (lastRound ? [lastRound] : []));
  const [mode, setMode] = useState("raw");
  const [showTrend, setShowTrend] = useState(false);
  const [zoneRound, setZoneRound] = useState(lastRound);
  const [zoneView, setZoneView] = useState("bar");
  const [avgRound, setAvgRound] = useState(lastRound);
  const [velRound, setVelRound] = useState(lastRound);
  const [goldRound, setGoldRound] = useState(lastRound);

  const tickColor = "var(--text-tertiary)";
  const grid = "var(--border)";

  // ── PB sets ──
  const { allTimePBs, monthlyPBs } = useMemo(() => {
    const all = new Set(), month = new Set(), now = new Date();
    activeRounds.forEach((r) => {
      let best = 0, bestM = 0;
      scores.filter((s) => s.round_name === r).sort((a, b) => new Date(a.shot_at) - new Date(b.shot_at)).forEach((h) => {
        if (h.score > best) { best = h.score; all.add(r + "::" + h.shot_at + "::" + h.score); }
        if ((now - new Date(h.shot_at)) / 86400000 <= 30 && h.score > bestM) { bestM = h.score; month.add(r + "::" + h.shot_at + "::" + h.score); }
      });
    });
    return { allTimePBs: all, monthlyPBs: month };
  }, [scores, activeRounds]);

  const chartData = useMemo(() => {
    const dates = [...new Set(activeRounds.flatMap((r) => scores.filter((s) => s.round_name === r).map((s) => s.shot_at)))].sort();
    return dates.map((date) => {
      const pt = { date };
      activeRounds.forEach((r) => {
        const h = scores.find((s) => s.round_name === r && s.shot_at === date);
        if (h) {
          pt[r] = mode === "pct" ? normPct(h.score, r) : h.score;
          pt[r + "_pb"] = allTimePBs.has(r + "::" + date + "::" + h.score) ? "gold" : monthlyPBs.has(r + "::" + date + "::" + h.score) ? "silver" : null;
        }
      });
      return pt;
    });
  }, [scores, activeRounds, mode, allTimePBs, monthlyPBs]);

  const trendInsights = useMemo(() => {
    if (!showTrend) return [];
    return activeRounds.map((r) => {
      const d = scores.filter((s) => s.round_name === r).sort((a, b) => new Date(a.shot_at) - new Date(b.shot_at));
      if (d.length < 3) return null;
      const reg = linReg(d.map((h) => (mode === "pct" ? normPct(h.score, r) : h.score)));
      if (!reg) return null;
      return { round: r, dir: reg.slope > 0 ? "↑" : "↓", abs: Math.abs(Math.round(reg.slope * 10) / 10), unit: mode === "pct" ? "%" : "pts", color: PROG_COLORS[activeRounds.indexOf(r)] };
    }).filter(Boolean);
  }, [scores, activeRounds, mode, showTrend]);

  const distData = useMemo(() => {
    if (!zoneRound) return { bars: [], total: 0 };
    const sc = ROUNDS[zoneRound]?.scoring || "10z";
    const zones = zonesFor(sc), counts = {};
    zones.forEach((z) => (counts[z] = 0));
    let total = 0;
    scores.filter((s) => s.round_name === zoneRound).forEach((h) => (h.ends || []).forEach((e) => (e.arrows || []).forEach((a) => { if (a != null && counts[a] !== undefined) { counts[a]++; total++; } })));
    return { bars: zones.map((z) => ({ zone: z, label: zoneLabel(z), count: counts[z], pct: total ? Math.round((counts[z] / total) * 1000) / 10 : 0 })), total };
  }, [scores, zoneRound]);

  const avgData = useMemo(() => {
    if (!avgRound) return [];
    return scores.filter((s) => s.round_name === avgRound).sort((a, b) => new Date(a.shot_at) - new Date(b.shot_at))
      .map((h) => { const arrows = arrowCount(h.ends); return { date: h.shot_at, avg: arrows ? Math.round((h.score / arrows) * 100) / 100 : 0, arrows }; });
  }, [scores, avgRound]);

  const velData = useMemo(() => {
    if (!velRound) return [];
    const d = scores.filter((s) => s.round_name === velRound).sort((a, b) => new Date(a.shot_at) - new Date(b.shot_at));
    return d.slice(1).map((h, i) => ({ date: h.shot_at, delta: h.score - d[i].score }));
  }, [scores, velRound]);

  const goldData = useMemo(() => {
    if (!goldRound) return [];
    return scores.filter((s) => s.round_name === goldRound).sort((a, b) => new Date(a.shot_at) - new Date(b.shot_at)).map((h) => ({ date: h.shot_at, golds: h.golds ?? 0 }));
  }, [scores, goldRound]);

  const heatWeeks = useMemo(() => {
    const now = new Date(), start = new Date(now);
    start.setDate(start.getDate() - 363 - start.getDay());
    const map = {};
    scores.forEach((h) => { const d = h.shot_at?.slice(0, 10); if (!d) return; const p = normPct(h.score, h.round_name) ?? 1; if (!map[d] || p > map[d]) map[d] = p; });
    const weeks = []; let cur = new Date(start);
    while (cur <= now) { const wk = []; for (let i = 0; i < 7; i++) { const ds = cur.toISOString().slice(0, 10); wk.push({ date: ds, pct: map[ds] ?? null }); cur = new Date(cur); cur.setDate(cur.getDate() + 1); } weeks.push(wk); }
    return weeks;
  }, [scores]);
  const heatCol = (pct) => (pct == null ? "var(--surface-3)" : pct < 40 ? "#bfdbfe" : pct < 60 ? "#60a5fa" : pct < 75 ? "#2563eb" : "#1e3a8a");

  const stats = useMemo(() => {
    const last10 = scores.slice().sort((a, b) => new Date(b.shot_at) - new Date(a.shot_at)).slice(0, 10);
    const avg10 = last10.length ? Math.round(last10.reduce((s, h) => s + h.score, 0) / last10.length) : 0;
    const norm = scores.map((h) => normPct(h.score, h.round_name)).filter((v) => v != null);
    const avgNorm = norm.length ? Math.round((norm.reduce((a, b) => a + b, 0) / norm.length) * 10) / 10 : 0;
    const consistency = allRounds.map((r) => { const d = scores.filter((s) => s.round_name === r); return d.length < 2 ? null : { round: r, std: stdDev(d.map((s) => s.score)), n: d.length }; }).filter(Boolean).sort((a, b) => a.std - b.std);
    const pbByRound = allRounds.map((r) => { const d = scores.filter((s) => s.round_name === r); if (!d.length) return null; const pb = d.slice().sort((a, b) => b.score - a.score)[0]; return { round: r, score: pb.score, date: pb.shot_at, pct: normPct(pb.score, r) }; }).filter(Boolean);
    return { total: scores.length, avg10, avgNorm, consistency, pbByRound };
  }, [scores, allRounds]);

  if (!scores.length) return <div className="card text-center text-sm opacity-70">No rounds saved yet. Add a score to see your progress.</div>;

  const tipStyle = { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)" };
  const toggle = (on) => ({ borderRadius: 8, border: "1px solid var(--border)", padding: "5px 12px", fontSize: 13, cursor: "pointer", background: on ? "var(--accent)" : "transparent", color: on ? "var(--accent-foreground)" : "var(--text-secondary)" });
  const RoundPicker = ({ value, set }) => (
    <select value={value} onChange={(e) => set(e.target.value)} className="input-field">
      <option value="">Select a round</option>
      {allRounds.map((r) => <option key={r} value={r}>{r}</option>)}
    </select>
  );
  const empty = (msg) => <div className="text-center text-sm opacity-70" style={{ padding: "2rem" }}>{msg}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="tab-nav" style={{ overflowX: "auto" }}>
        {TABS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setSub(id)} className={sub === id ? "active" : ""}>{label}</button>
        ))}
      </div>

      {/* ── Progress ── */}
      {sub === "progress" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select className="input-field" value="" onChange={(e) => { const r = e.target.value; if (!r || activeRounds.includes(r)) return; if (activeRounds.length >= 5) return; setActiveRounds([...activeRounds, r]); }}>
              <option value="">+ Add round</option>
              {allRounds.filter((r) => !activeRounds.includes(r)).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="button" style={toggle(mode === "pct")} onClick={() => setMode((m) => (m === "raw" ? "pct" : "raw"))}>{mode === "pct" ? "% mode" : "Raw score"}</button>
            <button type="button" style={toggle(showTrend)} onClick={() => setShowTrend((v) => !v)}>Trend</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeRounds.map((r, i) => (
              <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px 4px 10px", borderRadius: 20, border: `1px solid ${PROG_COLORS[i]}`, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: PROG_COLORS[i] }} />{r}
                <button type="button" onClick={() => setActiveRounds(activeRounds.filter((x) => x !== r))} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 15, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          {trendInsights.length > 0 && <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{trendInsights.map((t) => <span key={t.round} style={{ marginRight: 14 }}><span style={{ color: t.color }}>{t.round}</span>: {t.dir} ~{t.abs}{t.unit}/session</span>)}</div>}
          {activeRounds.length === 0 ? empty("Add a round above to see your chart.") : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tipStyle} formatter={(v) => (mode === "pct" ? `${v}%` : v)} />
                {activeRounds.map((r, i) => (
                  <Line key={r} dataKey={r} stroke={PROG_COLORS[i]} strokeWidth={2} strokeDasharray={PROG_DASHES[i]} connectNulls={false}
                    dot={(p) => { const pb = p.payload?.[r + "_pb"]; if (pb === "gold") return <text key={p.key} x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central" fontSize={14}>★</text>; if (pb === "silver") return <text key={p.key} x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="#888">✦</text>; return <circle key={p.key} cx={p.cx} cy={p.cy} r={4} fill={PROG_COLORS[i]} stroke="var(--surface-1)" strokeWidth={1.5} />; }}
                    activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>★ all-time PB&nbsp;&nbsp;✦ monthly PB</div>
        </div>
      )}

      {/* ── Zones ── */}
      {sub === "zones" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-70">Arrow score zone breakdown — how your arrows are distributed.</p>
          <div className="flex flex-wrap items-center gap-3">
            <RoundPicker value={zoneRound} set={setZoneRound} />
            {distData.total > 0 && <span className="text-xs opacity-60">{distData.total} arrows</span>}
            <div className="flex gap-1 ml-auto">
              {["bar", "pie"].map(v => (
                <button key={v} onClick={() => setZoneView(v)}
                  className="text-xs px-2.5 py-1 rounded-lg border-none cursor-pointer font-medium"
                  style={{ background: zoneView === v ? "var(--accent)" : "var(--surface-3)", color: zoneView === v ? "var(--accent-foreground)" : "var(--text-secondary)" }}>
                  {v === "bar" ? "Bar" : "Target"}
                </button>
              ))}
            </div>
          </div>
          {!distData.total ? empty("No arrow data for this round yet.") : (
            <>
              {zoneView === "bar" ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={distData.bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: tickColor }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>{distData.bars.map((d) => <Cell key={d.zone} fill={RNG[d.zone] || "var(--accent)"} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <TargetFaceSVG bars={distData.bars} total={distData.total} />
              )}
              {zoneView === "bar" && (
                <div className="flex flex-wrap gap-2">
                  {distData.bars.filter((b) => b.count > 0).map((b) => (
                    <span key={b.zone} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "var(--surface-2)", fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: RNG[b.zone] || "var(--accent)" }} /><b>{b.label}</b><span className="opacity-60">{b.count} ({b.pct}%)</span>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Averages ── */}
      {sub === "averages" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-70">Per-arrow average and total arrows shot over time.</p>
          <RoundPicker value={avgRound} set={setAvgRound} />
          {!avgData.length ? empty("No arrow data for this round yet.") : (
            <>
              <p className="text-xs font-medium opacity-70">Per-arrow average</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={avgData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={tipStyle} formatter={(v) => [v, "Avg/arrow"]} />
                  <Line type="monotone" dataKey="avg" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 3.5 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs font-medium opacity-70" style={{ marginTop: 8 }}>Cumulative arrows shot</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={avgData.map((d, i) => ({ ...d, cumulative: avgData.slice(0, i + 1).reduce((s, x) => s + x.arrows, 0) }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tipStyle} formatter={(v) => [v, "Total arrows"]} />
                  <Bar dataKey="cumulative" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Sessions" value={avgData.length} />
                <Stat label="Total arrows" value={avgData.reduce((s, d) => s + d.arrows, 0)} />
                <Stat label="Best avg" value={Math.max(...avgData.map((d) => d.avg))} />
                <Stat label="Latest avg" value={avgData[avgData.length - 1]?.avg ?? "—"} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Velocity ── */}
      {sub === "velocity" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-70">Score change vs previous session. Green = improvement.</p>
          <RoundPicker value={velRound} set={setVelRound} />
          {velData.length < 1 ? empty(`Need at least 2 sessions of ${velRound || "this round"}.`) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={velData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tipStyle} formatter={(v) => `${v >= 0 ? "+" : ""}${v} pts`} />
                <Bar dataKey="delta" radius={[4, 4, 0, 0]}>{velData.map((d, i) => <Cell key={i} fill={d.delta >= 0 ? "#16a34a" : "#dc2626"} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Golds ── */}
      {sub === "golds" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-70">Gold count per session.</p>
          <RoundPicker value={goldRound} set={setGoldRound} />
          {!goldData.length ? empty("No data.") : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={goldData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="golds" fill="#b7860b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Activity ── */}
      {sub === "activity" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm opacity-70">52 weeks of activity. Darker = higher normalised score.</p>
          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 13px)", gap: 3 }}>
              {heatWeeks.flatMap((wk, wi) => wk.map((day, di) => (
                <div key={`${wi}-${di}`} title={day.pct != null ? `${day.date} · ${day.pct}%` : day.date}
                  style={{ width: 13, height: 13, borderRadius: 3, background: heatCol(day.pct), border: "1px solid var(--border-subtle)" }} />
              )))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-60">
            <span>Lower</span>
            {[null, 30, 50, 70, 90].map((p, i) => <span key={i} style={{ width: 13, height: 13, borderRadius: 3, background: heatCol(p) }} />)}
            <span>Higher</span>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      {sub === "stats" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Rounds shot" value={stats.total} />
            <Stat label="Avg (last 10)" value={stats.avg10} />
            <Stat label="Normalised avg" value={`${stats.avgNorm}%`} />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">Consistency</h3>
            {stats.consistency.length === 0 ? <p className="text-sm opacity-70">Need 2+ sessions per round.</p> : (
              <div className="flex flex-col gap-2">
                {stats.consistency.map((c) => (
                  <div key={c.round} className="flex items-center gap-3 text-sm"><span className="flex-1">{c.round}</span><span className="opacity-70">{c.n} sessions</span><span className="font-medium">±{c.std} pts</span></div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">PBs by round</h3>
            <div className="flex flex-col gap-2">
              {stats.pbByRound.map((r) => (
                <div key={r.round} className="flex items-center gap-3 text-sm"><span className="flex-1">{r.round}</span><span className="opacity-70">{r.date}</span><span className="font-medium">{r.score}{r.pct != null ? ` (${r.pct}%)` : ""}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
