"use client";

import { useState } from "react";

const BG = { X: "#f3d34e", "10": "#f3d34e", "9": "#f3d34e", "8": "#e8394a", "7": "#e8394a", "6": "#1a6bbf", "5": "#1a6bbf", "4": "#1f1f1f", "3": "#1f1f1f", "2": "#e8e8e8", "1": "#e8e8e8", M: "#4caf50" };
const FG = { X: "#5c4500", "10": "#5c4500", "9": "#5c4500", "8": "#fff", "7": "#fff", "6": "#fff", "5": "#fff", "4": "#fff", "3": "#fff", "2": "#222", "1": "#222", M: "#fff" };
const VAL = { X: 10, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2, "1": 1, M: 0, "5z5": 5, "5z4": 4, "5z3": 3, "5z2": 2, "5z1": 1 };

export default function ScoreDetail({ score, max, pct, hits, totalArrows, golds, ends, roundName, round }) {
  const [showEnds, setShowEnds] = useState(false);
  const hasEnds = ends && Array.isArray(ends) && ends.length > 0;

  return (
    <>
      <button
        onClick={() => hasEnds && setShowEnds(!showEnds)}
        className="card flex flex-col gap-2 w-full text-left"
        style={{
          cursor: hasEnds ? "pointer" : "default",
          border: showEnds ? "2px solid var(--accent)" : undefined,
          transition: "border-color 0.15s ease",
        }}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Score</span>
          <span className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {score}{max ? ` / ${max}` : ""}
          </span>
        </div>
        {pct != null && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Percentage</span>
            <span className="text-lg font-semibold">{pct}%</span>
          </div>
        )}
        {hits != null && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Hits</span>
            <span className="text-lg font-medium">{hits}{totalArrows ? ` / ${totalArrows}` : ""}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Golds</span>
          <span className="text-lg font-medium">{golds ?? "—"}</span>
        </div>
        {hasEnds && (
          <div className="text-xs font-medium mt-1" style={{ color: "var(--accent)" }}>
            {showEnds ? "▲ Hide scoresheet" : "▼ Tap to view end-by-end scoresheet"}
          </div>
        )}
      </button>

      {showEnds && hasEnds && (
        <div className="card" style={{ overflow: "visible" }}>
          <h3 className="text-sm font-semibold mb-3">End-by-end scoresheet</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ padding: "6px 8px", fontSize: 11, textAlign: "center", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>End</th>
                  {Array.from({ length: ends[0]?.arrows?.length || 3 }).map((_, i) => (
                    <th key={i} style={{ padding: "6px 4px", fontSize: 11, textAlign: "center", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>{i + 1}</th>
                  ))}
                  <th style={{ padding: "6px 8px", fontSize: 11, textAlign: "center", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>ET</th>
                  <th style={{ padding: "6px 8px", fontSize: 11, textAlign: "center", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>RT</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let runningTotal = 0;
                  return ends.map((end, ei) => {
                    const endTotal = (end.arrows || []).reduce((s, a) => s + (VAL[a] || 0), 0);
                    runningTotal += endTotal;
                    return (
                      <tr key={ei} style={{ borderBottom: "1px solid var(--border-subtle, rgba(0,0,0,0.05))" }}>
                        <td style={{ padding: "4px 8px", fontSize: 12, textAlign: "center", fontWeight: 600, color: "var(--text-secondary)" }}>{ei + 1}</td>
                        {(end.arrows || []).map((a, ai) => (
                          <td key={ai} style={{ padding: "2px" }}>
                            <div style={{
                              width: 32, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                              background: a ? (BG[a] || "var(--surface-3)") : "transparent",
                              color: a ? (FG[a] || "var(--text-primary)") : "var(--text-tertiary)",
                              fontSize: 13, fontWeight: 500, borderRadius: 4,
                              border: "1px solid rgba(0,0,0,0.08)",
                            }}>
                              {a || ""}
                            </div>
                          </td>
                        ))}
                        <td style={{ padding: "4px 8px", fontSize: 13, textAlign: "center", fontWeight: 500 }}>{endTotal}</td>
                        <td style={{ padding: "4px 8px", fontSize: 13, textAlign: "center", fontWeight: 600, color: "var(--accent)" }}>{runningTotal}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--border)" }}>
                  <td colSpan={(ends[0]?.arrows?.length || 3) + 1} style={{ padding: "8px", fontSize: 13, fontWeight: 700, textAlign: "right" }}>Total</td>
                  <td style={{ padding: "8px", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
                    {ends.reduce((s, end) => s + (end.arrows || []).reduce((es, a) => es + (VAL[a] || 0), 0), 0)}
                  </td>
                  <td style={{ padding: "8px", fontSize: 15, fontWeight: 700, textAlign: "center", color: "var(--accent)" }}>{score}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
