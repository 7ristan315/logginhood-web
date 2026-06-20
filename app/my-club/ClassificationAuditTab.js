"use client";

import { useState, useEffect, useTransition } from "react";
import { getClassification, LBL } from "@/lib/classification";
import { updateScoreClassification, bulkUpdateClassifications } from "./classification/actions";

const AUTO_KEY = "lghood_cls_autoupdate";

const CLS_COLORS = {
  IGMB: "#a855f7", IMB: "#8b5cf6",
  IB1:  "#3b82f6", IB2: "#60a5fa", IB3: "#93c5fd",
  IA1:  "#22c55e", IA2: "#4ade80", IA3: "#86efac",
};

function ClsChip({ label }) {
  if (!label) return <span style={{ opacity: 0.4, fontSize: 12 }}>—</span>;
  return (
    <span style={{
      background: CLS_COLORS[label] + "33",
      color: CLS_COLORS[label],
      border: `1px solid ${CLS_COLORS[label]}55`,
      borderRadius: 4, padding: "1px 6px", fontSize: 12, fontWeight: 600,
    }}>{label}</span>
  );
}

function ClsSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value ?? ""}
      onChange={e => onChange(e.target.value || null)}
      disabled={disabled}
      style={{
        fontSize: 12, padding: "2px 6px", borderRadius: 4,
        background: "var(--background)", border: "1px solid var(--border)",
        color: "var(--foreground)", cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <option value="">None</option>
      {LBL.map(l => <option key={l} value={l}>{l}</option>)}
    </select>
  );
}

export default function ClassificationAuditTab({ scores, members, clubId }) {
  // Build gender map from members
  const genderMap = Object.fromEntries(
    (members || []).map(m => [m.profile_id, m.profiles?.gender])
  );
  const nameMap = Object.fromEntries(
    (members || []).map(m => [m.profile_id, m.profiles?.full_name || "Unknown"])
  );

  // Run audit once
  const audited = (scores || []).map(s => {
    const gender = genderMap[s.profile_id];
    const calculated = gender
      ? getClassification(s.bow_type, s.age_category, gender, s.round_name, s.score)
      : undefined;
    const knownRound = calculated !== undefined && calculated !== null || calculated === null && gender;
    return {
      ...s,
      archer: nameMap[s.profile_id],
      gender,
      calculated: calculated ?? null,
      noThresholds: calculated === undefined,
      changed: calculated !== undefined && calculated !== s.classification,
    };
  });

  const discrepancies = audited.filter(s => s.changed);
  const noThresholds = audited.filter(s => s.noThresholds).length;
  const correct = audited.length - discrepancies.length - noThresholds;

  const [autoUpdate, setAutoUpdate] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [applied, setApplied] = useState({}); // scoreId → newClassification
  const [editing, setEditing] = useState({}); // scoreId → pending value
  const [isPending, startTransition] = useTransition();
  const [bulkDone, setBulkDone] = useState(null); // {updated}
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTO_KEY) === "true";
    setAutoUpdate(saved);
    if (saved && discrepancies.length > 0) {
      setCountdown(5);
    }
  }, []);

  // Countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      applyBulk(discrepancies);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function toggleAutoUpdate(val) {
    setAutoUpdate(val);
    localStorage.setItem(AUTO_KEY, val ? "true" : "false");
  }

  function cancelCountdown() {
    setCountdown(null);
  }

  function applyBulk(items) {
    const updates = items
      .filter(s => !applied[s.id])
      .map(s => ({ id: s.id, classification: s.calculated }));
    if (!updates.length) return;
    startTransition(async () => {
      const result = await bulkUpdateClassifications(updates, clubId);
      const newApplied = {};
      for (const u of updates) newApplied[u.id] = u.classification;
      setApplied(prev => ({ ...prev, ...newApplied }));
      setBulkDone({ updated: updates.length });
    });
  }

  function saveInlineEdit(scoreId, newVal) {
    startTransition(async () => {
      await updateScoreClassification(scoreId, newVal, clubId);
      setApplied(prev => ({ ...prev, [scoreId]: newVal }));
      setEditing(prev => { const n = { ...prev }; delete n[scoreId]; return n; });
    });
  }

  // Compute effective classification for a score (after applied changes)
  function effectiveCls(s) {
    return applied[s.id] !== undefined ? applied[s.id] : s.classification;
  }

  const pendingDiscrepancies = discrepancies.filter(s => applied[s.id] === undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "1rem" }}>

      {/* Header + controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Classification audit</h2>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={e => toggleAutoUpdate(e.target.checked)}
              style={{ width: 14, height: 14 }}
            />
            Auto-update on load
          </label>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
        {[
          { label: "Scores checked", value: audited.length, color: "var(--foreground)" },
          { label: "Correct", value: correct, color: "#22c55e" },
          { label: "Discrepancies", value: pendingDiscrepancies.length, color: pendingDiscrepancies.length > 0 ? "#f59e0b" : "#22c55e" },
          { label: "Unknown round", value: noThresholds, color: "var(--foreground)", opacity: 0.5 },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "0.75rem 1rem",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, opacity: stat.opacity }}>{stat.value}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Auto-update countdown banner */}
      {countdown !== null && (
        <div style={{
          background: "#f59e0b22", border: "1px solid #f59e0b55",
          borderRadius: 8, padding: "0.75rem 1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 14 }}>
            Auto-updating {pendingDiscrepancies.length} classification{pendingDiscrepancies.length !== 1 ? "s" : ""} in {countdown}s…
          </span>
          <button onClick={cancelCountdown} style={{
            fontSize: 12, padding: "4px 12px", borderRadius: 4,
            background: "transparent", border: "1px solid var(--border)",
            cursor: "pointer", color: "var(--foreground)",
          }}>Cancel</button>
        </div>
      )}

      {/* Bulk done banner */}
      {bulkDone && (
        <div style={{
          background: "#22c55e22", border: "1px solid #22c55e55",
          borderRadius: 8, padding: "0.75rem 1rem", fontSize: 14,
        }}>
          Updated {bulkDone.updated} classification{bulkDone.updated !== 1 ? "s" : ""} successfully.
        </div>
      )}

      {/* Discrepancies section */}
      {pendingDiscrepancies.length > 0 && countdown === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#f59e0b" }}>
              {pendingDiscrepancies.length} discrepanc{pendingDiscrepancies.length !== 1 ? "ies" : "y"} found
            </h3>
            <button
              onClick={() => applyBulk(pendingDiscrepancies)}
              disabled={isPending}
              style={{
                fontSize: 13, padding: "6px 14px", borderRadius: 6,
                background: "var(--accent)", color: "var(--accent-foreground)",
                border: "none", cursor: isPending ? "not-allowed" : "pointer", fontWeight: 600,
              }}
            >
              {isPending ? "Updating…" : `Update all ${pendingDiscrepancies.length}`}
            </button>
          </div>

          <div style={{ border: "1px solid #f59e0b55", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f59e0b11", borderBottom: "1px solid var(--border)" }}>
                  {["Archer","Round","Score","Stored","Calculated",""].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, opacity: 0.7 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingDiscrepancies.map((s, i) => (
                  <tr key={s.id} style={{
                    borderBottom: i < pendingDiscrepancies.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "transparent" : "var(--accent-light, #ffffff08)",
                  }}>
                    <td style={{ padding: "8px 12px" }}>{s.archer}</td>
                    <td style={{ padding: "8px 12px" }}>{s.round_name}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.score}</td>
                    <td style={{ padding: "8px 12px" }}><ClsChip label={s.classification} /></td>
                    <td style={{ padding: "8px 12px" }}><ClsChip label={s.calculated} /></td>
                    <td style={{ padding: "8px 12px" }}>
                      <button
                        onClick={() => {
                          const updates = [{ id: s.id, classification: s.calculated }];
                          startTransition(async () => {
                            await updateScoreClassification(s.id, s.calculated, clubId);
                            setApplied(prev => ({ ...prev, [s.id]: s.calculated }));
                          });
                        }}
                        disabled={isPending}
                        style={{
                          fontSize: 12, padding: "3px 10px", borderRadius: 4,
                          background: "var(--accent)", color: "var(--accent-foreground)",
                          border: "none", cursor: "pointer",
                        }}
                      >Apply</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingDiscrepancies.length === 0 && !countdown && (
        <div style={{
          background: "#22c55e11", border: "1px solid #22c55e33",
          borderRadius: 8, padding: "0.75rem 1rem", fontSize: 14, color: "#22c55e",
        }}>
          All classifications are up to date.
        </div>
      )}

      {/* All scores with inline edit */}
      <div>
        <button
          onClick={() => setShowAll(v => !v)}
          style={{
            fontSize: 13, padding: "6px 14px", borderRadius: 6,
            background: "transparent", border: "1px solid var(--border)",
            cursor: "pointer", color: "var(--foreground)",
          }}
        >
          {showAll ? "Hide" : "Show"} all scores ({audited.length})
        </button>

        {showAll && (
          <div style={{ marginTop: "1rem", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  {["Archer","Round","Score","Bow","Current classification","Edit"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, opacity: 0.7 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audited.map((s, i) => {
                  const isEditing = editing[s.id] !== undefined;
                  const cls = effectiveCls(s);
                  const isChanged = applied[s.id] !== undefined;
                  return (
                    <tr key={s.id} style={{
                      borderBottom: i < audited.length - 1 ? "1px solid var(--border)" : "none",
                      background: s.changed && !isChanged ? "#f59e0b08" : i % 2 === 0 ? "transparent" : "var(--accent-light, #ffffff08)",
                    }}>
                      <td style={{ padding: "8px 12px" }}>{s.archer}</td>
                      <td style={{ padding: "8px 12px" }}>{s.round_name}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.score}</td>
                      <td style={{ padding: "8px 12px", opacity: 0.7 }}>{s.bow_type}</td>
                      <td style={{ padding: "8px 12px" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <ClsSelect
                              value={editing[s.id]}
                              onChange={val => setEditing(prev => ({ ...prev, [s.id]: val }))}
                              disabled={isPending}
                            />
                            <button
                              onClick={() => saveInlineEdit(s.id, editing[s.id])}
                              disabled={isPending}
                              style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 4,
                                background: "var(--accent)", color: "var(--accent-foreground)",
                                border: "none", cursor: "pointer",
                              }}
                            >Save</button>
                            <button
                              onClick={() => setEditing(prev => { const n={...prev}; delete n[s.id]; return n; })}
                              style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 4,
                                background: "transparent", border: "1px solid var(--border)",
                                cursor: "pointer", color: "var(--foreground)",
                              }}
                            >✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <ClsChip label={cls} />
                            {isChanged && <span style={{ fontSize: 10, color: "#22c55e" }}>updated</span>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {!isEditing && (
                          <button
                            onClick={() => setEditing(prev => ({ ...prev, [s.id]: cls }))}
                            style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 4,
                              background: "transparent", border: "1px solid var(--border)",
                              cursor: "pointer", color: "var(--foreground)",
                            }}
                          >Edit</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
