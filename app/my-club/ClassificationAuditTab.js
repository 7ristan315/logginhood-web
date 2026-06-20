"use client";

import { useState, useEffect, useTransition } from "react";
import { LBL, getClassificationFromRows } from "@/lib/classification";
import {
  updateScoreClassification,
  bulkUpdateClassifications,
  saveThreshold,
  deleteThresholdRow,
  syncThreshold,
} from "./classification/actions";

const AUTO_SCORE_KEY = "lghood_cls_autoupdate";
const AUTO_THRESHOLD_KEY = "lghood_threshold_autosync";
const TODAY = new Date().toISOString().slice(0, 10);

const CLS_COLORS = {
  IGMB:"#a855f7", IMB:"#8b5cf6",
  IB1:"#3b82f6",  IB2:"#60a5fa", IB3:"#93c5fd",
  IA1:"#22c55e",  IA2:"#4ade80", IA3:"#86efac",
};

const BOW_TYPES    = ["Recurve","Compound","Barebow","Longbow"];
const AGE_CATS     = ["Senior","50+","U18","U16","U15","U14","U12"];
const GENDERS      = ["men","women"];
const GENDER_LABEL = { men:"Men", women:"Women" };

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

// ── Confirm "update all" dialog ──────────────────────────────────────────────

function ConfirmAllDialog({ roundName, bowType, onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"#00000088", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem",
    }}>
      <div style={{
        background:"var(--background)", border:"1px solid var(--border)",
        borderRadius:12, padding:"1.5rem", maxWidth:480, width:"100%",
        display:"flex", flexDirection:"column", gap:"1rem",
      }}>
        <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Update all historical scores?</h3>
        <p style={{ margin:0, fontSize:14, lineHeight:1.6, opacity:0.8 }}>
          This will reclassify <strong>every {bowType} {roundName} score on record</strong>,
          regardless of when it was shot. Scores achieved before these thresholds came into
          effect may no longer reflect the classification earned under the rules at the time.
        </p>
        <p style={{ margin:0, fontSize:14, lineHeight:1.6, opacity:0.8 }}>
          Archery GB does not apply threshold changes retroactively — this option is provided
          for data correction purposes only. Are you sure you want to continue?
        </p>
        <div style={{ display:"flex", gap:"0.75rem", justifyContent:"flex-end", marginTop:"0.25rem" }}>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btnPrimary, background:"#ef4444" }}>
            Yes, update all scores
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Threshold Editor ─────────────────────────────────────────────────────────

function ThresholdEditor({ thresholds, clubId }) {
  const [bow,         setBow]        = useState("Recurve");
  const [age,         setAge]        = useState("Senior");
  const [gender,      setGender]     = useState("men");
  const [autoSync,    setAutoSync]   = useState(false);
  const [editRow,     setEditRow]    = useState(null);
  const [editVals,    setEditVals]   = useState([]);
  const [editDate,    setEditDate]   = useState(TODAY);
  const [newRound,    setNewRound]   = useState("");
  const [newVals,     setNewVals]    = useState(Array(8).fill(""));
  const [newDate,     setNewDate]    = useState(TODAY);
  const [showAdd,     setShowAdd]    = useState(false);
  const [saving,      setSaving]     = useState(false);
  const [syncMsg,     setSyncMsg]    = useState(null);
  const [confirmAll,  setConfirmAll] = useState(null); // {row, vals, date} pending confirm
  const [isPending,   startTransition] = useTransition();

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

  async function doSyncAndSave(round_name, parsed, effective_from, updateAll) {
    setSaving(true);
    setSyncMsg(null);
    await saveThreshold(bow, age, gender, round_name, parsed, effective_from, clubId);
    if (autoSync) {
      const result = await syncThreshold(
        bow, age, gender, round_name, parsed,
        updateAll ? null : effective_from, // null = all scores
        clubId
      );
      setSyncMsg(
        updateAll
          ? `Updated all ${result.synced} score${result.synced !== 1 ? "s" : ""} (full history)`
          : `Updated ${result.synced} score${result.synced !== 1 ? "s" : ""} from ${effective_from} onwards`
      );
    }
    setEditRow(null);
    setShowAdd(false);
    setSaving(false);
    setConfirmAll(null);
  }

  function handleSaveClick(row) {
    const parsed = editVals.map(v => v === "" || v == null ? null : Number(v));
    // Always save + date-scoped sync immediately; "update all" goes via confirm dialog
    doSyncAndSave(row.round_name, parsed, editDate, false);
  }

  function handleUpdateAll(row) {
    const parsed = editVals.map(v => v === "" || v == null ? null : Number(v));
    setConfirmAll({ round_name: row.round_name, parsed, date: editDate });
  }

  function handleAddSave(updateAll = false) {
    if (!newRound.trim()) return;
    const parsed = newVals.map(v => v === "" ? null : Number(v));
    if (updateAll) {
      setConfirmAll({ round_name: newRound.trim(), parsed, date: newDate, isNew: true });
    } else {
      doSyncAndSave(newRound.trim(), parsed, newDate, false);
      setNewRound("");
      setNewVals(Array(8).fill(""));
      setNewDate(TODAY);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Delete thresholds for "${row.round_name}"? This cannot be undone.`)) return;
    startTransition(() => deleteThresholdRow(row.id, clubId));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

      {confirmAll && (
        <ConfirmAllDialog
          roundName={confirmAll.round_name}
          bowType={bow}
          onConfirm={() => {
            const { round_name, parsed, date, isNew } = confirmAll;
            doSyncAndSave(round_name, parsed, date, true);
            if (isNew) { setNewRound(""); setNewVals(Array(8).fill("")); setNewDate(TODAY); }
          }}
          onCancel={() => setConfirmAll(null)}
        />
      )}

      {/* Filter bar */}
      <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center" }}>
        <select value={bow}    onChange={e=>setBow(e.target.value)}    style={selectStyle}>{BOW_TYPES.map(b=><option key={b}>{b}</option>)}</select>
        <select value={age}    onChange={e=>setAge(e.target.value)}    style={selectStyle}>{AGE_CATS.map(a=><option key={a}>{a}</option>)}</select>
        <select value={gender} onChange={e=>setGender(e.target.value)} style={selectStyle}>{GENDERS.map(g=><option key={g} value={g}>{GENDER_LABEL[g]}</option>)}</select>
        <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:13, cursor:"pointer", marginLeft:"auto" }}>
          <input type="checkbox" checked={autoSync} onChange={e=>toggleAutoSync(e.target.checked)} />
          Auto-sync scores on save
        </label>
      </div>

      {autoSync && (
        <p style={{ margin:0, fontSize:12, opacity:0.6, lineHeight:1.5 }}>
          When enabled, saving a threshold will automatically reclassify member scores shot
          on or after the effective date. Use "Update all historical scores" to override this
          and reclassify everything on record.
        </p>
      )}

      {syncMsg && (
        <div style={{ background:"#22c55e22", border:"1px solid #22c55e44", borderRadius:6, padding:"8px 12px", fontSize:13, color:"#22c55e" }}>
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
              {autoSync && <th style={th}>Effective from</th>}
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isEditing = editRow === row.id;
              return (
                <tr key={row.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ ...td, fontWeight:500 }}>{row.round_name}</td>
                  {LBL.map((l, idx) => (
                    <td key={l} style={td}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editVals[idx] ?? ""}
                          onChange={e => { const v=[...editVals]; v[idx]=e.target.value; setEditVals(v); }}
                          style={numInput}
                        />
                      ) : (
                        <span style={{ opacity: row.thresholds[idx] == null ? 0.3 : 1 }}>
                          {row.thresholds[idx] ?? "—"}
                        </span>
                      )}
                    </td>
                  ))}
                  {autoSync && (
                    <td style={td}>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={e=>setEditDate(e.target.value)}
                          style={{ ...numInput, width:120 }}
                        />
                      ) : (
                        <span style={{ opacity:0.5, fontSize:11 }}>
                          {row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-GB") : "—"}
                        </span>
                      )}
                    </td>
                  )}
                  <td style={{ ...td, whiteSpace:"nowrap" }}>
                    {isEditing ? (
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        <button onClick={()=>handleSaveClick(row)} disabled={saving} style={btnPrimary}>
                          {saving ? "Saving…" : autoSync ? `Save & sync from ${editDate}` : "Save"}
                        </button>
                        {autoSync && (
                          <button onClick={()=>handleUpdateAll(row)} disabled={saving} style={{ ...btnGhost, color:"#f59e0b", borderColor:"#f59e0b55" }}>
                            Update all historical scores
                          </button>
                        )}
                        <button onClick={()=>setEditRow(null)} style={btnGhost}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={()=>{ setEditRow(row.id); setEditVals(row.thresholds.map(v=>v??"")); setEditDate(TODAY); }} style={btnGhost}>Edit</button>
                        <button onClick={()=>handleDelete(row)} style={{ ...btnGhost, color:"#ef4444" }}>Del</button>
                      </div>
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
                    style={{ ...numInput, width:120 }}
                  />
                </td>
                {LBL.map((l, idx) => (
                  <td key={l} style={td}>
                    <input
                      type="number"
                      value={newVals[idx]}
                      onChange={e=>{ const v=[...newVals]; v[idx]=e.target.value; setNewVals(v); }}
                      style={numInput}
                    />
                  </td>
                ))}
                {autoSync && (
                  <td style={td}>
                    <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{ ...numInput, width:120 }} />
                  </td>
                )}
                <td style={{ ...td, whiteSpace:"nowrap" }}>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    <button onClick={()=>handleAddSave(false)} disabled={saving||!newRound.trim()} style={btnPrimary}>
                      {saving ? "Adding…" : autoSync ? `Add & sync from ${newDate}` : "Add"}
                    </button>
                    {autoSync && (
                      <button onClick={()=>handleAddSave(true)} disabled={saving||!newRound.trim()} style={{ ...btnGhost, color:"#f59e0b", borderColor:"#f59e0b55" }}>
                        Add & update all
                      </button>
                    )}
                    <button onClick={()=>setShowAdd(false)} style={btnGhost}>✕</button>
                  </div>
                </td>
              </tr>
            )}

            {!filtered.length && !showAdd && (
              <tr><td colSpan={autoSync ? 11 : 10} style={{ ...td, opacity:0.5, textAlign:"center" }}>No thresholds for this combination</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!showAdd && (
        <button onClick={()=>setShowAdd(true)} style={{ ...btnGhost, alignSelf:"flex-start" }}>
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
      archer:       nameMap[s.profile_id],
      gender,
      calculated:   calculated ?? null,
      noThresholds: calculated === undefined,
      changed:      calculated !== undefined && calculated !== s.classification,
    };
  });

  const discrepancies     = audited.filter(s => s.changed);
  const noThresholdsCount = audited.filter(s => s.noThresholds).length;
  const correct           = audited.length - discrepancies.length - noThresholdsCount;

  const [autoScore,   setAutoScore]  = useState(false);
  const [countdown,   setCountdown]  = useState(null);
  const [applied,     setApplied]    = useState({});
  const [editing,     setEditing]    = useState({});
  const [showAll,     setShowAll]    = useState(false);
  const [activeTab,   setActiveTab]  = useState("audit");
  const [bulkMsg,     setBulkMsg]    = useState(null);
  const [isPending,   startTransition] = useTransition();

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

      {activeTab === "thresholds" && (
        <ThresholdEditor thresholds={thresholds} clubId={clubId} />
      )}

      {activeTab === "audit" && (<>

        <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:13, cursor:"pointer" }}>
            <input type="checkbox" checked={autoScore} onChange={e=>toggleAutoScore(e.target.checked)} />
            Auto-update scores on load
          </label>
        </div>

        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:"0.75rem" }}>
          {[
            { label:"Checked",        value:audited.length,               color:"var(--foreground)" },
            { label:"Correct",        value:correct,                      color:"#22c55e" },
            { label:"Discrepancies",  value:pendingDiscrepancies.length,  color:pendingDiscrepancies.length>0?"#f59e0b":"#22c55e" },
            { label:"Unknown round",  value:noThresholdsCount,            color:"var(--foreground)", dim:true },
          ].map(stat=>(
            <div key={stat.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"0.75rem 1rem" }}>
              <div style={{ fontSize:22, fontWeight:700, color:stat.color, opacity:stat.dim?0.4:1 }}>{stat.value}</div>
              <div style={{ fontSize:12, opacity:0.6, marginTop:2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

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
                      <td style={td}><button onClick={()=>applyOne(s)} disabled={isPending} style={btnPrimary}>Apply</button></td>
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
const selectStyle = { fontSize:13, padding:"5px 8px", borderRadius:6, background:"var(--background)", border:"1px solid var(--border)", color:"var(--foreground)" };
const numInput    = { width:52, fontSize:11, padding:"2px 4px", borderRadius:3, background:"var(--background)", border:"1px solid var(--border)", color:"var(--foreground)" };
const th = { padding:"8px 10px", textAlign:"left", fontWeight:600, opacity:0.7, whiteSpace:"nowrap" };
const td = { padding:"8px 10px" };
const btnPrimary = { fontSize:12, padding:"4px 10px", borderRadius:4, background:"var(--accent)", color:"var(--accent-foreground)", border:"none", cursor:"pointer", fontWeight:600 };
const btnGhost   = { fontSize:12, padding:"4px 10px", borderRadius:4, background:"transparent", border:"1px solid var(--border)", cursor:"pointer", color:"var(--foreground)" };
