"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)","var(--chart-6)","var(--chart-7)","var(--chart-8)"];
const tooltipStyle = { backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

const BRACKETS = ["Under 300", "300-399", "400-449", "450-499", "500-549", "550+"];

export default function ArcherDemographics({ equipPerf, setupDna, filtered }) {
  const ageDistribution = useMemo(() => {
    const byAge = {};
    (filtered.equip || []).forEach(r => {
      const age = r.age_category || "Unknown";
      if (!byAge[age]) byAge[age] = { name: age, count: 0 };
      byAge[age].count += r.sample_size;
    });
    return Object.values(byAge).sort((a, b) => b.count - a.count);
  }, [filtered.equip]);

  const genderSplit = useMemo(() => {
    const byGender = {};
    (filtered.equip || []).forEach(r => {
      const g = r.gender || "Unknown";
      if (!byGender[g]) byGender[g] = { name: g, count: 0 };
      byGender[g].count += r.sample_size;
    });
    return Object.values(byGender).filter(g => g.name !== "Unknown");
  }, [filtered.equip]);

  const skillPyramid = useMemo(() => {
    const byBracket = {};
    (filtered.dna || []).forEach(r => {
      const b = r.score_bracket;
      if (!byBracket[b]) byBracket[b] = { bracket: b, archers: 0, rounds: 0 };
      byBracket[b].archers += r.archer_count;
      byBracket[b].rounds += r.round_count;
    });
    return BRACKETS.map(b => byBracket[b] || { bracket: b, archers: 0, rounds: 0 });
  }, [filtered.dna]);

  const equipByLevel = useMemo(() => {
    const result = {};
    (filtered.dna || []).forEach(r => {
      const bracket = r.score_bracket;
      if (!result[bracket]) result[bracket] = {};
      const riser = r.riser || "Unknown";
      result[bracket][riser] = (result[bracket][riser] || 0) + r.archer_count;
    });
    return BRACKETS.map(b => {
      const items = Object.entries(result[b] || {})
        .filter(([name]) => name !== "Unknown")
        .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 13) + "…" : name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      return { bracket: b, top: items };
    }).filter(b => b.top.length > 0);
  }, [filtered.dna]);

  const totalArchers = ageDistribution.reduce((s, a) => s + a.count, 0);
  const topAge = ageDistribution[0];
  const topGender = genderSplit.sort((a, b) => b.count - a.count)[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Insight cards */}
      {totalArchers > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topAge && (
            <div className="card" style={{ borderLeft: "3px solid var(--chart-1)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>Largest age group</p>
              <p className="text-lg font-bold" style={{ color: "var(--chart-1)" }}>{topAge.name}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{Math.round(topAge.count / totalArchers * 100)}% of all rounds</p>
            </div>
          )}
          {topGender && (
            <div className="card" style={{ borderLeft: "3px solid var(--chart-2)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>Gender split</p>
              <p className="text-lg font-bold" style={{ color: "var(--chart-2)" }}>{genderSplit.map(g => `${g.name}: ${Math.round(g.count / totalArchers * 100)}%`).join(", ")}</p>
            </div>
          )}
          <div className="card" style={{ borderLeft: "3px solid var(--chart-3)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>Total data points</p>
            <p className="text-lg font-bold" style={{ color: "var(--chart-3)" }}>{totalArchers.toLocaleString()}</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>rounds with equipment data</p>
          </div>
        </div>
      )}

      <div className="grid-responsive-2" style={{ gap: 16 }}>
        {/* Age distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Age distribution</h3>
          {ageDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Rounds" radius={[6, 6, 0, 0]}>
                  {ageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: "var(--text-tertiary)" }}>No data</div>
          )}
        </div>

        {/* Skill pyramid */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Skill level distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={skillPyramid}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="archers" name="Archers" radius={[6, 6, 0, 0]} fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment by skill level */}
      {equipByLevel.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Popular equipment by skill level</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>Top 3 risers at each score bracket</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {equipByLevel.map(level => (
              <div key={level.bracket} className="flex flex-col gap-1.5 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{level.bracket}</span>
                {level.top.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: "var(--text-tertiary)" }}>{i + 1}.</span>
                    <span className="text-xs truncate" title={item.name}>{item.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
