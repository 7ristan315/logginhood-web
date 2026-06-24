"use client";

import { useState } from "react";
import { LEVELS, LEVEL_NAMES, LEVEL_SHORT, LEVEL_COLOURS, TIERS, tierForLevel, calculateProgress, availableLevels } from "@/lib/classification-rules";

function ProgressRing({ size, stroke, progress, colour, children }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(progress, 1) * circ);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={colour} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function TierBadge({ level, achieved, size = 40 }) {
  const colour = LEVEL_COLOURS[level];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: achieved ? colour : "var(--card)",
      border: `2px solid ${achieved ? colour : "var(--border)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 700,
      color: achieved ? "#fff" : "var(--foreground)",
      opacity: achieved ? 1 : 0.3,
      transition: "all 0.3s ease",
    }}>
      {LEVEL_SHORT[level]}
    </div>
  );
}

function ScoreChip({ score }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 8, fontSize: 12,
      background: "var(--card)", border: "1px solid var(--border)",
    }}>
      <span style={{ fontWeight: 600 }}>{score.round_name}</span>
      <span style={{ color: "var(--accent)", fontWeight: 700 }}>{score.score}</span>
      <span style={{ opacity: 0.5 }}>{score.shot_at}</span>
    </div>
  );
}

function LevelDetail({ levelData, isIndoor }) {
  const { level, name, colour, qualifying, totalArrows, arrowsRequired, arrowsMet, scoresMet, achieved, qualifyingScores, requiredEvent } = levelData;
  const scorePct = Math.min(qualifying / 3, 1);
  const arrowPct = Math.min(totalArrows / arrowsRequired, 1);

  const eventLabel = requiredEvent === "any" ? "Any event" : requiredEvent === "competitive" ? "Competition" : "Record Status";

  return (
    <div style={{
      padding: 16, borderRadius: 12,
      background: achieved ? `${colour}15` : "var(--card)",
      border: `1px solid ${achieved ? colour : "var(--border)"}`,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TierBadge level={level} achieved={achieved} size={36} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>{eventLabel} required</div>
          </div>
        </div>
        {achieved && <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: colour, color: "#fff", fontWeight: 600 }}>Achieved</span>}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Scores progress */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ opacity: 0.6 }}>Qualifying scores</span>
            <span style={{ fontWeight: 600, color: scoresMet ? colour : "var(--foreground)" }}>{qualifying} / 3</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scorePct * 100}%`, background: colour, borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Arrows progress */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ opacity: 0.6 }}>Arrows</span>
            <span style={{ fontWeight: 600, color: arrowsMet ? colour : "var(--foreground)" }}>{totalArrows} / {arrowsRequired}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${arrowPct * 100}%`, background: colour, borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      {qualifyingScores.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {qualifyingScores.map((s, i) => <ScoreChip key={i} score={s} />)}
        </div>
      )}
    </div>
  );
}

export default function ClassificationTracker({ scores, thresholds, profile }) {
  const [tab, setTab] = useState("outdoor");
  const [expanded, setExpanded] = useState(false);

  const bowType = profile?.bow_type || "Recurve";
  const ageCategory = profile?.age_category || "Senior";
  const gender = profile?.gender || "Male";
  const isIndoor = tab === "indoor";

  const progress = calculateProgress(scores, thresholds, bowType, ageCategory, gender, isIndoor);
  const currentIdx = progress.currentLevel ? LEVELS.indexOf(progress.currentLevel) : -1;
  const nextData = progress.nextLevel;
  const levels = availableLevels(isIndoor);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Classification Progress</h2>
          <p style={{ fontSize: 12, opacity: 0.5, margin: "2px 0 0" }}>
            {bowType} · {ageCategory} · {gender} · {progress.season.label} season
          </p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["outdoor", "indoor"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: "pointer",
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "var(--accent-foreground)" : "var(--foreground)",
              border: tab === t ? "none" : "1px solid var(--border)",
            }}>
              {t === "outdoor" ? "Outdoor" : "Indoor"}
            </button>
          ))}
        </div>
      </div>

      {/* Tier progression bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 0" }}>
        {levels.map((level, i) => {
          const data = progress.levels.find(l => l.level === level);
          const achieved = data?.achieved;
          const isNext = progress.nextLevel?.level === level;
          return (
            <div key={level} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <TierBadge level={level} achieved={achieved} size={isNext ? 48 : 38} />
                {isNext && (
                  <div style={{
                    position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                    fontSize: 10, fontWeight: 600, color: LEVEL_COLOURS[level],
                    whiteSpace: "nowrap",
                  }}>
                    Next
                  </div>
                )}
              </div>
              {i < levels.length - 1 && (
                <div style={{
                  width: 20, height: 2, background: achieved ? LEVEL_COLOURS[level] : "var(--border)",
                  transition: "background 0.3s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current + next level hero */}
      <div style={{ display: "grid", gridTemplateColumns: nextData ? "1fr 1fr" : "1fr", gap: 16 }}>
        {/* Current level */}
        <div style={{
          padding: 20, borderRadius: 14,
          background: progress.currentLevel ? `${LEVEL_COLOURS[progress.currentLevel]}15` : "var(--card)",
          border: `1px solid ${progress.currentLevel ? LEVEL_COLOURS[progress.currentLevel] : "var(--border)"}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <div style={{ fontSize: 11, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>Current</div>
          {progress.currentLevel ? (
            <>
              <ProgressRing size={90} stroke={6} progress={1} colour={LEVEL_COLOURS[progress.currentLevel]}>
                <span style={{ fontSize: 22, fontWeight: 800, color: LEVEL_COLOURS[progress.currentLevel] }}>
                  {LEVEL_SHORT[progress.currentLevel]}
                </span>
              </ProgressRing>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{LEVEL_NAMES[progress.currentLevel]}</div>
            </>
          ) : (
            <>
              <ProgressRing size={90} stroke={6} progress={0} colour="var(--border)">
                <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.4 }}>—</span>
              </ProgressRing>
              <div style={{ fontSize: 14, opacity: 0.5 }}>Unclassified</div>
            </>
          )}
        </div>

        {/* Next level */}
        {nextData && (
          <div style={{
            padding: 20, borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <div style={{ fontSize: 11, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>Next target</div>
            <ProgressRing size={90} stroke={6} progress={nextData.qualifying / 3} colour={nextData.colour}>
              <span style={{ fontSize: 22, fontWeight: 800, color: nextData.colour }}>
                {LEVEL_SHORT[nextData.level]}
              </span>
            </ProgressRing>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{nextData.name}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              {nextData.qualifying}/3 scores · {nextData.totalArrows}/{nextData.arrowsRequired} arrows
            </div>
          </div>
        )}
      </div>

      {/* Detailed levels */}
      <button onClick={() => setExpanded(!expanded)} style={{
        padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)",
        background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--foreground)",
        display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
      }}>
        <span style={{ fontWeight: 600 }}>All classification levels</span>
        <span style={{ opacity: 0.4 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {progress.levels.map(l => (
            <LevelDetail key={l.level} levelData={l} isIndoor={isIndoor} />
          ))}
        </div>
      )}
    </div>
  );
}
