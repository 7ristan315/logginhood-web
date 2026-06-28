"use client";

import { useState, useMemo } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

function ScoreGauge({ score, label, color }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(${color} ${pct * 3.6}deg, var(--surface-3) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface-1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color }}>{score}</div>
      </div>
      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}

function InsightCard({ icon, title, body, type }) {
  const styles = {
    positive: { bg: "var(--success-light)", border: "var(--success)", color: "var(--success-text)" },
    warning: { bg: "var(--warning-light)", border: "var(--warning)", color: "var(--warning-text)" },
    negative: { bg: "var(--danger-light)", border: "var(--danger)", color: "var(--danger-text)" },
    info: { bg: "var(--info-light)", border: "var(--info)", color: "var(--info-text)" },
  }[type] || { bg: "var(--surface-2)", border: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="flex gap-3 p-3 rounded-lg text-sm" style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div><span className="font-semibold">{title}: </span>{body}</div>
    </div>
  );
}

export default function BrandHealth({ equipPerf, marketShare, switching }) {
  const [selectedBrand, setSelectedBrand] = useState("");

  const brands = useMemo(() => {
    const b = {};
    (marketShare || []).forEach(r => {
      const riser = r.riser;
      if (!riser) return;
      const brand = riser.split(" ")[0];
      if (!b[brand]) b[brand] = 0;
      b[brand] += r.archer_count || 0;
    });
    return Object.entries(b).sort((a, b) => b[1] - a[1]).map(([name]) => name).slice(0, 20);
  }, [marketShare]);

  const health = useMemo(() => {
    if (!selectedBrand) return null;

    const brandMarket = (marketShare || []).filter(r => r.riser?.startsWith(selectedBrand));
    const allMarket = (marketShare || []).filter(r => r.riser);
    const brandPerf = (equipPerf || []).filter(r => r.riser?.startsWith(selectedBrand));
    const allPerf = (equipPerf || []).filter(r => r.riser);

    const totalArchers = allMarket.reduce((s, r) => s + (r.archer_count || 0), 0);
    const brandArchers = brandMarket.reduce((s, r) => s + (r.archer_count || 0), 0);
    const shareScore = Math.min(100, Math.round(brandArchers / Math.max(1, totalArchers) * 100 * 5));

    const brandAvg = brandPerf.length > 0 ? brandPerf.reduce((s, r) => s + r.avg_score * r.sample_size, 0) / brandPerf.reduce((s, r) => s + r.sample_size, 0) : 0;
    const allAvg = allPerf.length > 0 ? allPerf.reduce((s, r) => s + r.avg_score * r.sample_size, 0) / allPerf.reduce((s, r) => s + r.sample_size, 0) : 0;
    const perfScore = Math.min(100, Math.max(0, Math.round(50 + (brandAvg - allAvg) * 2)));

    const brandStd = brandPerf.length > 0 ? brandPerf.reduce((s, r) => s + (r.score_stddev || 0) * r.sample_size, 0) / brandPerf.reduce((s, r) => s + r.sample_size, 0) : 50;
    const consistencyScore = Math.min(100, Math.max(0, Math.round(100 - brandStd * 1.5)));

    const products = new Set();
    brandMarket.forEach(r => { if (r.riser) products.add(r.riser); });
    const diversityScore = Math.min(100, products.size * 15);

    const brandSamples = brandPerf.reduce((s, r) => s + r.sample_size, 0);
    const loyaltyScore = Math.min(100, Math.round(Math.log2(Math.max(1, brandSamples)) * 10));

    const overall = Math.round((shareScore * 0.25 + perfScore * 0.3 + consistencyScore * 0.2 + diversityScore * 0.1 + loyaltyScore * 0.15));

    const radarData = [
      { metric: "Market share", value: shareScore },
      { metric: "Performance", value: perfScore },
      { metric: "Consistency", value: consistencyScore },
      { metric: "Range depth", value: diversityScore },
      { metric: "Loyalty", value: loyaltyScore },
    ];

    const insights = [];
    if (shareScore > 60) insights.push({ icon: "🏆", title: "Market leader", body: `${selectedBrand} holds ${Math.round(brandArchers / Math.max(1, totalArchers) * 100)}% market share — strong brand recognition.`, type: "positive" });
    else if (shareScore < 20) insights.push({ icon: "📉", title: "Low share", body: `Only ${Math.round(brandArchers / Math.max(1, totalArchers) * 100)}% market share. Consider awareness campaigns or activation code partnerships.`, type: "warning" });

    if (perfScore > 65) insights.push({ icon: "⚡", title: "Above average", body: `${selectedBrand} products score ${Math.round(brandAvg - allAvg)} points above the platform average — a strong selling point.`, type: "positive" });
    else if (perfScore < 40) insights.push({ icon: "⚠️", title: "Below average", body: `Scores ${Math.round(allAvg - brandAvg)} points below average. Investigate whether specific models are pulling the average down.`, type: "negative" });

    if (consistencyScore > 75) insights.push({ icon: "🎯", title: "Reliable", body: "Low score variance — archers using this brand deliver consistent results.", type: "positive" });
    else if (consistencyScore < 40) insights.push({ icon: "📊", title: "High variance", body: "Wide score spread. Some products may suit certain archer levels better — consider segmented marketing.", type: "warning" });

    if (diversityScore < 30) insights.push({ icon: "📦", title: "Narrow range", body: "Few products tracked. Expanding the lineup or ensuring existing products are registered would improve visibility.", type: "info" });

    return { overall, shareScore, perfScore, consistencyScore, diversityScore, loyaltyScore, radarData, insights, brandArchers, totalArchers, brandAvg: Math.round(brandAvg), allAvg: Math.round(allAvg), products: products.size, samples: brandSamples };
  }, [selectedBrand, marketShare, equipPerf, switching]);

  return (
    <div className="flex flex-col gap-5">
      <div className="card">
        <h3 className="text-sm font-semibold mb-1">Brand health score</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
          Composite score combining market share, performance, consistency, range depth, and loyalty. Methodology: weighted average (performance 30%, share 25%, consistency 20%, loyalty 15%, range 10%).
        </p>
        <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border cursor-pointer w-full max-w-xs"
          style={{ background: "var(--surface-1)", borderColor: selectedBrand ? "var(--accent)" : "var(--border)", color: "var(--text-primary)" }}>
          <option value="">Select a brand…</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {health && (
        <>
          {/* Score gauges */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold">{selectedBrand}</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: health.overall >= 60 ? "var(--success)" : health.overall >= 40 ? "var(--warning)" : "var(--danger)" }}>{health.overall}</span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>/ 100</span>
              </div>
            </div>

            <div className="flex justify-around flex-wrap gap-4 mb-4">
              <ScoreGauge score={health.shareScore} label="Share" color="var(--chart-1)" />
              <ScoreGauge score={health.perfScore} label="Performance" color="var(--chart-2)" />
              <ScoreGauge score={health.consistencyScore} label="Consistency" color="var(--chart-3)" />
              <ScoreGauge score={health.loyaltyScore} label="Loyalty" color="var(--chart-5)" />
              <ScoreGauge score={health.diversityScore} label="Range" color="var(--chart-4)" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div><span className="font-bold text-base" style={{ color: "var(--accent)" }}>{health.brandArchers}</span><br /><span style={{ color: "var(--text-tertiary)" }}>archers</span></div>
              <div><span className="font-bold text-base">{health.products}</span><br /><span style={{ color: "var(--text-tertiary)" }}>products</span></div>
              <div><span className="font-bold text-base">{health.brandAvg}</span><br /><span style={{ color: "var(--text-tertiary)" }}>avg score</span></div>
              <div><span className="font-bold text-base">{health.samples}</span><br /><span style={{ color: "var(--text-tertiary)" }}>rounds tracked</span></div>
            </div>
          </div>

          {/* Radar */}
          <div className="card">
            <h4 className="text-sm font-semibold mb-3">Brand profile</h4>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={health.radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <Radar name={selectedBrand} dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: "var(--accent)" }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Actionable insights */}
          {health.insights.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Actionable insights</h4>
              {health.insights.map((ins, i) => (
                <InsightCard key={i} {...ins} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
