"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { LBL, getClassificationFromRows } from "@/lib/classification";
import {
  updateScoreClassification,
  bulkUpdateClassifications,
  saveThreshold,
  deleteThresholdRow,
  autoSyncThreshold,
} from "./classification/actions";

const AUTO_SCORE_KEY = "lghood_cls_autoupdate";
const AUTO_THRESHOLD_KEY = "lghood_threshold_autosync";

const CLS_COLORS = {
  IGMB:"#a855f7", IMB:"#8b5cf6",
  IB1:"#3b82f6",  IB2:"#60a5fa", IB3:"#93c5fd",
  IA1:"#22c55e",  IA2:"#4ade80", IA3:"#86efac",
};

const BOW_TYPES     = ["Recurve","Compound","Barebow","Longbow"];
const AGE_CATS      = ["Senior","50+","U18","U16","U15","U14","U12"];
const GENDERS       = ["men","women"];
const GENDER_LABEL  = { men:"Men", women:"Women" };

function ClsChip({ label }) {
  if (!label) return <span style={{ opacity:0.4, fontSize:12 }}>—</span>;
  return (
    <span style={{
      background: CLS_COLORS[label]+"33", color: CLS_COLORS[label],
      border:`1px solid ${CLS_COLORS[label]}55`,
      borderRadius:4, padding:"1px 6px", fontSize:12, fontWeight:600,
    }}>{label}</span>
  );
}

// ── Threshold Editor ─────────────────────────────────────────────────────────

function ThresholdEditor({ thresholds, clubId, onSaved }) {
  const [bow,     setBow]     = useState("Recurve");
  const [age,     setAge]     = useState("Senior");
  const [gender,  setGender]  = useState("men");
  const [autoSync, setAutoSync] = useState(false);
  const [editRow, setEditRow] = useState(null); // rowId being edited
  const [editVals, setEditVals] = useState([]); // [8] ints
  const [newRound, setNewRound] = useState("");
  const [newVals,  setNewVals]  = useState(Array(8).fill(""));
  const [showAdd,  setShowAdd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [syncMsg,  setSyncMsg]  = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAutoSync(localStorage.getItem(AUTO_THRESHOLD_KEY) === "true");
  }, []);

  function toggleAutoSync(v) {
    setAutoSync(v);
    localStorage.setItem(AUTO_THRESHOLD_KEY, v ? "true" : "false");
  }

  const filtered = thresholds.filter(r =>
    r.bow_type === bow && r.age_category === age && r.gender === gender
  );

  async function handleSave(row, vals) {
    setSaving(true);
    setSyncMsg(null);
    const parsed = vals.map(v => v === "" || v === null || v === undefined ? null : Number(v));
    await saveThreshold(bow, age, gender, row.round_name, parsed, clubId);
    if (autoSync) {
      const result = await autoSyncThreshold(bow, age, gender, row.round_name, parsed, clubId);
      setSyncMsg(`Auto-synced ${result.synced} score${result.synced !== 1 ? "s" : ""}`);
    }
    setEditRow(null);
    setSaving(false);
    onSaved?.();
  }

  async function handleAdd() {
    if (!newRound.trim()) return;
    setSaving(true);
    const parsed = newVals.map(v => v === "" ? null : Number(v));
    await saveThreshold(bow, age, gender, newRound.trim(), parsed, clubId);
    if (autoSync) {
      const result = await autoSyncThreshold(bow, age, gender, newRound.trim(), parsed, clubId);
      setSyncMsg(`Auto-synced ${result.synced} score${result.synced !== 1 ? "s" : ""}`);
    }
    setNewRound("");
    setNewVals(Array(8).fill(""));
    setShowAdd(false);
    setSaving(false);
    onSaved?.();
  }

  async function handleDelete(row) {
    if (!confirm(`Delete thresholds for ${row.round_name}?`)) return;
    startTransition(() => deleteThresholdRow(row.id, clubId));
    onSaved?.();
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      {/* Filter bar */}
      <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center" }}>
        <select value={bow} onChange={e=>setBow(e.target.value)} style={selectStyle}>
          {BOW_TYPES.map(b=><option key={b}>{b}</option>)}
        </select>
        <select value={age} onChange={e=>setAge(e.target.value)} style={selectStyle}>
          {AGE_CATS.map(a=><option key={a}>{a}</option>)}
        </select>
        <select value={gender} onChange={e=>setGender(e.target.value)} style={selectStyle}>
          {GENDERS.map(g=><option key={g} value={g}>{GENDER_LABEL[g]}</option>)}
        </select>
        <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:13, cursor:"pointer", marginLeft:"auto" }}>
          <input type="checkbox" checked={autoSync} onChange={e=>toggleAutoSync(e.target.checked)} />
          Auto-sync scores on save
        </label>
      </div>

      {syncMsg && (
        <div style={{ background:"#22c55e22", border:"1px solid #22c55e44", borderRadius:6, padding:"6px 12px", fontSize:13, color:"#22c55e" }}>
          {syncMsg}
        </div>
      )}

      {/* Threshold table */}
      <div style={{ border:"1px solid var(--border)", borderRadius:8, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:"var(--card)", borderBottom:"1px solid var(--border)" }}>
              <th style={th}>Round</th>
              {LBL.map(l=><th key={l} style={{ ...th, color:CLS_COLORS[l] }}>{l}</th>)}
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isEditing = editRow === row.id;
              return (
                <tr key={row.id} style={{ borderBottom: i < filtered.length-1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ ...td, fontWeight:500 }}>{row.round_name}</td>
                  {LBL.map((l, idx) => (
                    <td key={l} style={td}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editVals[idx] ?? ""}
                          onChange={e => {
                            const v = [...editVals];
                            v[idx] = e.target.value;
                            setEditVals(v);
                          }}
                          style={{ width:52, fontSize:11, padding:"2px 4px", borderRadius:3,
                            background:"var(--background)", border:"1px solid var(--border)", color:"var(--foreground)" }}
                        />
                      ) : (
                        <span style={{ opacity: row.thresholds[idx] == null ? 0.3 : 1 }}>
                          {row.thresholds[idx] ?? "—"}
                        </span>
                      )}
                    </td>
                  ))}
                  <td style={{ ...td, whiteSpace:"nowrap" }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(row, editVals)} disabled={saving} style={btnPrimary}>
                          {saving ? "…" : "Save"}
                        </button>
                        <button onClick={() => setEditRow(null)} style={{ ...btnGhost, marginLeft:4 }}>✕</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditRow(row.id); setEditVals(row.thresholds.map(v=>v??"")); }} style={btnGhost}>Edit</button>
                        <button onClick={() => handleDelete(row)} style={{ ...btnGhost, marginLeft:4, color:"#ef4444" }}>Del</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Add new row */}
            {showAdd && (
              <tr style={{ borderTop:"1px solid var(--border)", background:"var(--accent-light, #ffffff08)" }}>
                <td style={td}>
                  <input
                    type="text"
                    placeholder="Round name"
                    value={newRound}
                    onChange={e=>setNewRound(e.target.value)}
                    style={{ width:110, fontSize:11, padding:"2px 4px", borderRadius:3,
                      background:"var(--background)", border:"1px solid var(--border)", color:"var(--foreground)" }}
                  />
                </td>
                {LBL.map((l, idx) => (
                  <td key={l} style={td}>
                    <input
                      type="number"
                      value={newVals[idx]}
                      onChange={e => { const v=[...newVals]; v[idx]=e.target.value; setNewVals(v); }}
                      style={{ width:52, fontSize:11, padding:"2px 4px", borderRadius:3,
                        background:"var(--background)", border:"1px solid var(--border)", color:"var(--foreground)" }}
                    />
                  </td>
                ))}
                <td style={{ ...td, whiteSpace:"nowrap" }}>
                  <button onClick={handleAdd} disabled={saving || !newRound.trim()} style={btnPrimary}>
                    {saving ? "…" : "Add"}
                  </button>
                  <button onClick={() => setShowAdd(false)} style={{ ...btnGhost, marginLeft:4 }}>✕</button>
                </td>
              </tr>
            )}

            {!filtered.length && !showAdd && (
              <tr><td colSpan={10} style={{ ...td, opacity:0.5, textAlign:"center" }}>No thresholds for this combination</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!showAdd && (
        <button onClick={() => setShowAdd(true)} style={{ ...btnGhost, alignSelf:"flex-start" }}>
          + Add round
        </button>
      )}
    </div>
  );
}

// ── Score Audit ──────────────────────────────────────────────────────────────

export default function ClassificationAuditTab({ scores, members, thresholds, clubId }) {
  const genderMap = Object.fromEntries((members||[]).map(m=>[m.profile_id, m.profiles?.gender]));
  const nameMap   = Object.fromEntries((members||[]).map(m=>[m.profile_id, m.profiles?.full_name||"Unknown"]));

  const audited = (scores||[]).map(s => {
    const gender = genderMap[s.profile_id];
    const calculated = gender
      ? getClassificationFromRows(thresholds, s.bow_type, s.age_category, gender, s.round_name, s.score)
      : undefined;
    return {
      ...s,
      archer: nameMap[s.profile_id],
      gender,
      calculated: calculated ?? null,
      noThresholds: calculated === undefined,
      changed: calculated !== undefined && calculated !== s.classification,
    };
  });

  const discrepancies    = audited.filter(s => s.changed);
  const noThresholdsCount = audited.filter(s => s.noThresholds).length;
  const correct           = audited.length - discrepancies.length - noThresholdsCount;

  const [autoScore,  setAutoScore]  = useState(false);
  const [countdown,  setCountdown]  = useState(null);
  const [applied,    setApplied]    = useState({});
  const [editing,    setEditing]    = useState({});
  const [showAll,    setShowAll]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("audit"); // "audit" | "thresholds"
  const [bulkMsg,    setBulkMsg]    = useState(null);
  const [isPending,  startTransition] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem(AUTO_SCORE_KEY) === "true";
    setAutoScore(saved);
    if (saved && discrepancies.length > 0) setCountdown(5);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { setCountdown(null); applyBulk(discrepancies); return; }
    const t = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function toggleAutoScore(v) {
    setAutoScore(v);
    localStorage.setItem(AUTO_SCORE_KEY, v ? "true" : "false");
  }

  function applyBulk(items) {
    const updates = items.filter(s => applied[s.id] === undefined)
      .map(s => ({ id: s.id, classification: s.calculated }));
    if (!updates.length) return;
    startTransition(async () => {
      await bulkUpdateClassifications(updates, clubId);
      const next = {};
      for (const u of updates) next[u.id] = u.classification;
      setApplied(prev => ({ ...prev, ...next }));
      setBulkMsg(`Updated ${updates.length} score${updates.length!==1?"s":""}`);
    });
  }

  function applyOne(s) {
    startTransition(async () => {
      await updateScoreClassification(s.id, s.calculated, clubId);
      setApplied(prev => ({ ...prev, [s.id]: s.calculated }));
    });
  }

  function saveEdit(scoreId, val) {
    startTransition(async () => {
      await updateScoreClassification(scoreId, val, clubId);
      setApplied(prev => ({ ...prev, [scoreId]: val }));
      setEditing(prev => { const n={...prev}; delete n[scoreId]; return n; });
    });
  }

  const pendingDiscrepancies = discrepancies.filter(s => applied[s.id] === undefined);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem", paddingTop:"1rem" }}>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--border)" }}>
        {[["audit","Score audit"],["thresholds","AGB thresholds"]].map(([key,label])=>(
          <button key={key} onClick={()=>setActiveTab(key)} style={{
            padding:"8px 16px", fontSize:13, fontWeight:activeTab===key?600:400,
            background:"transparent", border:"none", cursor:"pointer",
            color:activeTab===key?"var(--accent)":"var(--foreground)",
            borderBottom:activeTab===key?"2px solid var(--accent)":"2px solid transparent",
            marginBottom:-1,
          }}>{label}</button>
        ))}
      </div>

      {/* ── Threshold editor tab ── */}
      {activeTab === "thresholds" && (
        <ThresholdEditor thresholds={thresholds} clubId={clubId} />
      )}

      {/* ── Score audit tab ── */}
      {activeTab === "audit" && (<>

        {/* Controls */}
        <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:13, cursor:"pointer" }}>
            <input type="checkbox" checked={autoScore} onChange={e=>toggleAutoScore(e.target.checked)} />
            Auto-update scores on load
          </label>
        </div>

        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:"0.75rem" }}>
          {[
            { label:"Checked",       value:audited.length,           color:"var(--foreground)" },
            { label:"Correct",       value:correct,                  color:"#22c55e" },
            { label:"Discrepancies", value:pendingDiscrepancies.length, color:pendingDiscrepancies.length>0?"#f59e0b":"#22c55e" },
            { label:"Unknown round", value:noThresholdsCount,        color:"var(--foreground)", dim:true },
          ].map(stat=>(
            <div key={stat.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"0.75rem 1rem" }}>
              <div style={{ fontSize:22, fontWeight:700, color:stat.color, opacity:stat.dim?0.4:1 }}>{stat.value}</div>
              <div style={{ fontSize:12, opacity:0.6, marginTop:2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Countdown */}
        {countdown !== null && (
          <div style={{ background:"#f59e0b22", border:"1px solid #f59e0b55", borderRadius:8, padding:"0.75rem 1rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:14 }}>Auto-updating {pendingDiscrepancies.length} classification{pendingDiscrepancies.length!==1?"s":""} in {countdown}s…</span>
            <button onClick={()=>setCountdown(null)} style={btnGhost}>Cancel</button>
          </div>
        )}

        {bulkMsg && (
          <div style={{ background:"#22c55e22", border:"1px solid #22c55e55", borderRadius:8, padding:"0.75rem 1rem", fontSize:14, color:"#22c55e" }}>
            {bulkMsg}
          </div>
        )}

        {/* Discrepancies */}
        {pendingDiscrepancies.length > 0 && countdown === null && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={{ fontSize:14, fontWeight:600, margin:0, color:"#f59e0b" }}>
                {pendingDiscrepancies.length} discrepanc{pendingDiscrepancies.length!==1?"ies":"y"}
              </h3>
              <button onClick={()=>applyBulk(pendingDiscrepancies)} disabled={isPending} style={btnPrimary}>
                {isPending ? "Updating…" : `Update all ${pendingDiscrepancies.length}`}
              </button>
            </div>

            <div style={{ border:"1px solid #f59e0b55", borderRadius:8, overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f59e0b11", borderBottom:"1px solid var(--border)" }}>
                    {["Archer","Round","Score","Stored","Calculated",""].map(h=>(
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingDiscrepancies.map((s,i)=>(
                    <tr key={s.id} style={{ borderBottom:i<pendingDiscrepancies.length-1?"1px solid var(--border)":"none" }}>
                      <td style={td}>{s.archer}</td>
                      <td style={td}>{s.round_name}</td>
                      <td style={{ ...td, fontWeight:600 }}>{s.score}</td>
                      <td style={td}><ClsChip label={s.classification}/></td>
                      <td style={td}><ClsChip label={s.calculated}/></td>
                      <td style={td}>
                        <button onClick={()=>applyOne(s)} disabled={isPending} style={btnPrimary}>Apply</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pendingDiscrepancies.length === 0 && !countdown && (
          <div style={{ background:"#22c55e11", border:"1px solid #22c55e33", borderRadius:8, padding:"0.75rem 1rem", fontSize:14, color:"#22c55e" }}>
            All classifications are up to date.
          </div>
        )}

        {/* All scores (collapsed) */}
        <div>
          <button onClick={()=>setShowAll(v=>!v)} style={btnGhost}>
            {showAll?"Hide":"Show"} all scores ({audited.length})
          </button>

          {showAll && (
            <div style={{ marginTop:"1rem", border:"1px solid var(--border)", borderRadius:8, overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"var(--card)", borderBottom:"1px solid var(--border)" }}>
                    {["Archer","Round","Score","Bow","Classification",""].map(h=><th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {audited.map((s,i)=>{
                    const isEditing = editing[s.id] !== undefined;
                    const cls = applied[s.id] !== undefined ? applied[s.id] : s.classification;
                    return (
                      <tr key={s.id} style={{
                        borderBottom:i<audited.length-1?"1px solid var(--border)":"none",
                        background:s.changed&&applied[s.id]===undefined?"#f59e0b08":"transparent",
                      }}>
                        <td style={td}>{s.archer}</td>
                        <td style={td}>{s.round_name}</td>
                        <td style={{ ...td, fontWeight:600 }}>{s.score}</td>
                        <td style={{ ...td, opacity:0.7 }}>{s.bow_type}</td>
                        <td style={td}>
                          {isEditing ? (
                            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                              <select
                                value={editing[s.id]??""}
                                onChange={e=>setEditing(prev=>({...prev,[s.id]:e.target.value||null}))}
                                style={{ ...selectStyle, fontSize:11, padding:"2px 6px" }}
                              >
                                <option value="">None</option>
                                {LBL.map(l=><option key={l} value={l}>{l}</option>)}
                              </select>
                              <button onClick={()=>saveEdit(s.id,editing[s.id])} style={btnPrimary}>Save</button>
                              <button onClick={()=>setEditing(prev=>{const n={...prev};delete n[s.id];return n;})} style={btnGhost}>✕</button>
                            </div>
                          ) : (
                            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                              <ClsChip label={cls}/>
                              {applied[s.id]!==undefined&&<span style={{ fontSize:10,color:"#22c55e" }}>updated</span>}
                            </div>
                          )}
                        </td>
                        <td style={td}>
                          {!isEditing&&<button onClick={()=>setEditing(prev=>({...prev,[s.id]:cls}))} style={btnGhost}>Edit</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>)}
    </div>
  );
}

// Shared micro-styles
const selectStyle = {
  fontSize:13, padding:"5px 8px", borderRadius:6,
  background:"var(--background)", border:"1px solid var(--border)", color:"var(--foreground)",
};
const th = { padding:"8px 10px", textAlign:"left", fontWeight:600, opacity:0.7, whiteSpace:"nowrap" };
const td = { padding:"8px 10px" };
const btnPrimary = {
  fontSize:12, padding:"4px 10px", borderRadius:4,
  background:"var(--accent)", color:"var(--accent-foreground)",
  border:"none", cursor:"pointer", fontWeight:600,
};
const btnGhost = {
  fontSize:12, padding:"4px 10px", borderRadius:4,
  background:"transparent", border:"1px solid var(--border)",
  cursor:"pointer", color:"var(--foreground)",
};
