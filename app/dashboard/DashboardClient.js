"use client";

import { useState } from "react";
import Link from "next/link";

const LBL = ["IA3","IA2","IA1","IB3","IB2","IB1","IMB","IGMB"];
const BOW_ICON = { Recurve:"🏹", Compound:"⚙️", Barebow:"🎯", Longbow:"🌲" };
const CLS_COLOUR = {
  IGMB: "#a855f7", IMB: "#8b5cf6",
  IB1: "#3b82f6", IB2: "#60a5fa", IB3: "#93c5fd",
  IA1: "#22c55e", IA2: "#4ade80", IA3: "#86efac",
};

function Sparkline({ values, accent }) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 140, H = 36, bw = Math.floor(W / values.length) - 1;
  return (
    <svg width={W} height={H} style={{ overflow: "visible", display: "block" }}>
      {values.map((v, i) => {
        const h = Math.max(3, Math.round(((v - min) / range) * (H - 4)));
        const isLast = i === values.length - 1;
        return (
          <rect key={i} x={i * (bw + 1)} y={H - h} width={bw} height={h}
            fill={accent || "var(--accent)"} opacity={isLast ? 1 : 0.35 + (i / values.length) * 0.5} rx={1.5} />
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, sub, accent, icon, href }) {
  const inner = (
    <div className="dash-stat-card" style={accent ? { borderTop: `2.5px solid ${accent}` } : {}}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-value" style={accent ? { color: accent } : {}}>{value}</div>
      <div className="dash-stat-label">{label}</div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

function Section({ title, defaultOpen = true, children, action }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="dash-section">
      <button className="dash-section-header" onClick={() => setOpen(o => !o)}>
        <span className="dash-section-title">{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {action && <span onClick={e => e.stopPropagation()}>{action}</span>}
          <span className="dash-section-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▾
          </span>
        </div>
      </button>
      {open && <div className="dash-section-body">{children}</div>}
    </div>
  );
}

function TrendBadge({ diff }) {
  if (diff === null || diff === undefined) return null;
  const up = diff > 0;
  const same = diff === 0;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 20,
      background: same ? "var(--accent-light)" : up ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
      color: same ? "var(--foreground)" : up ? "#16a34a" : "#dc2626",
    }}>
      {same ? "=" : up ? `+${diff}` : diff}
    </span>
  );
}

export default function DashboardClient({ stats, recentScores, personalBests, byBow, sparklineData, sparklineRound }) {
  const [showAllRecent, setShowAllRecent] = useState(false);
  const displayRecent = showAllRecent ? recentScores : recentScores.slice(0, 6);

  const trendDiff = sparklineData.length >= 4
    ? Math.round(sparklineData[sparklineData.length - 1] - (sparklineData.slice(0, -1).reduce((a,b) => a+b, 0) / (sparklineData.length - 1)))
    : null;

  return (
    <div className="dash-root">

      {/* ── Hero stat strip ── */}
      <div className="dash-stats-grid">
        <StatCard
          label="Personal best"
          value={stats.pb ?? "—"}
          sub={stats.pbRound}
          icon="🏆"
          accent="#f59e0b"
          href="/history"
        />
        <StatCard
          label="Rounds this month"
          value={stats.roundsThisMonth}
          sub={stats.monthDiff !== null
            ? `${stats.monthDiff >= 0 ? "+" : ""}${stats.monthDiff} vs last month`
            : "this month"}
          icon="📅"
          href="/history"
        />
        <StatCard
          label="Total rounds"
          value={stats.total}
          sub={`${stats.totalGolds} golds`}
          icon="◎"
          href="/history"
        />
        {stats.bestCls && (
          <StatCard
            label="Best classification"
            value={stats.bestCls}
            sub={`${stats.bestClsBow} · ${stats.bestClsAge}`}
            icon="🎖️"
            accent={CLS_COLOUR[stats.bestCls]}
            href="/my-club?tab=badges"
          />
        )}
      </div>

      {/* ── Recent form sparkline ── */}
      {sparklineData.length > 2 && (
        <Section title={`Recent form — ${sparklineRound}`} defaultOpen={true}>
          <div className="dash-sparkline-row">
            <div>
              <Sparkline values={sparklineData} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.4, marginTop: 4, width: 140 }}>
                <span>{sparklineData.length} sessions</span>
                <span>latest →</span>
              </div>
            </div>
            <div className="dash-sparkline-stats">
              <div>
                <div className="dash-mini-label">Latest</div>
                <div className="dash-mini-value">{sparklineData[sparklineData.length - 1]}</div>
              </div>
              <div>
                <div className="dash-mini-label">Best</div>
                <div className="dash-mini-value" style={{ color: "var(--accent)" }}>{Math.max(...sparklineData)}</div>
              </div>
              <div>
                <div className="dash-mini-label">Avg</div>
                <div className="dash-mini-value">{Math.round(sparklineData.reduce((a,b) => a+b,0) / sparklineData.length)}</div>
              </div>
              <div>
                <div className="dash-mini-label">Trend</div>
                <div className="dash-mini-value"><TrendBadge diff={trendDiff} /></div>
              </div>
            </div>
          </div>
        </Section>
      )}

      <div className="dash-two-col">

        {/* ── Recent sessions ── */}
        <Section
          title="Recent sessions"
          defaultOpen={true}
          action={<Link href="/history" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>View all →</Link>}
        >
          <div className="dash-score-list">
            {displayRecent.map((s, i) => (
              <div key={s.id} className="dash-score-row">
                <div className="dash-score-round">
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{s.round_name}</span>
                  <span style={{ fontSize: 11, opacity: 0.45 }}>{s.shot_at} · {s.bow_type}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {s.isPB && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 20 }}>
                      PB
                    </span>
                  )}
                  {s.classification && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 20,
                      background: `${CLS_COLOUR[s.classification]}22`, color: CLS_COLOUR[s.classification] }}>
                      {s.classification}
                    </span>
                  )}
                  <TrendBadge diff={s.diffVsPrev} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", minWidth: 36, textAlign: "right" }}>
                    {s.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {recentScores.length > 6 && (
            <button onClick={() => setShowAllRecent(v => !v)} className="dash-show-more">
              {showAllRecent ? "Show less ↑" : `Show ${recentScores.length - 6} more ↓`}
            </button>
          )}
        </Section>

        {/* ── Personal bests ── */}
        <Section title="Personal bests" defaultOpen={true}>
          <div className="dash-score-list">
            {personalBests.map(s => (
              <div key={`${s.round_name}|${s.bow_type}`} className="dash-score-row">
                <div className="dash-score-round">
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{s.round_name}</span>
                  <span style={{ fontSize: 11, opacity: 0.45 }}>
                    {BOW_ICON[s.bow_type]} {s.bow_type} · {s.shot_at}
                  </span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{s.score}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* ── By bow type ── */}
      {byBow.length > 1 && (
        <Section title="Rounds by bow type" defaultOpen={false}>
          <div className="dash-bow-grid">
            {byBow.map(({ bow, count, pct }) => (
              <div key={bow} className="dash-bow-card">
                <span style={{ fontSize: 22 }}>{BOW_ICON[bow] || "🏹"}</span>
                <span style={{ fontWeight: 700, fontSize: 18 }}>{count}</span>
                <span style={{ fontSize: 12, opacity: 0.6 }}>{bow}</span>
                <div className="dash-bow-bar-track">
                  <div className="dash-bow-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
