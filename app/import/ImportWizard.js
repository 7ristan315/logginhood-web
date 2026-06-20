"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { importRows } from "./actions";

const FIELD_OPTIONS = [
  { value: "shot_at",        label: "Date shot" },
  { value: "round_name",     label: "Round name" },
  { value: "score",          label: "Score (total)" },
  { value: "golds",          label: "Golds / Xs / 10s" },
  { value: "bow_type",       label: "Bow type" },
  { value: "age_category",   label: "Age category" },
  { value: "classification", label: "Classification" },
  { value: "archer_name",    label: "Archer name" },
  { value: "notes",          label: "Notes" },
  { value: "ignore",         label: "— ignore —" },
];

const REQUIRED = ["shot_at", "round_name", "score"];

function confidenceColor(c) {
  if (c >= 0.85) return "#16a34a";
  if (c >= 0.6)  return "#d97706";
  return "#dc2626";
}

// ── Tiny CSV parser (no dependencies) ────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  function parseRow(line) {
    const out = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { q = !q; continue; }
      if (c === "," && !q) { out.push(cur.trim()); cur = ""; continue; }
      cur += c;
    }
    out.push(cur.trim());
    return out;
  }
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = parseRow(l);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

// ── Step components ───────────────────────────────────────────────────────────

function StepUpload({ onParsed }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      onParsed(parsed, file.name);
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Import your scores</h2>
        <p style={{ opacity: 0.55, fontSize: 14, margin: 0 }}>
          Upload a CSV export from Archers Toolbox, ArcherySuccess, My Archery, or any archery app. Claude will automatically map the columns.
        </p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--accent-light)"}`,
          borderRadius: 16, padding: "48px 32px", textAlign: "center", cursor: "pointer",
          background: dragging ? "var(--accent-light)" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop your CSV here</div>
        <div style={{ fontSize: 13, opacity: 0.5 }}>or click to browse</div>
        <input ref={inputRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
          onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div style={{ fontSize: 12, opacity: 0.4, textAlign: "center" }}>
        Supports CSV exports from any archery scoring app · Data stays private
      </div>
    </div>
  );
}

function StepMapping({ fileName, rowCount, onMappings }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", padding: "48px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Reading your data…</div>
      <div style={{ opacity: 0.5, fontSize: 14 }}>
        Claude is mapping the columns from <strong>{fileName}</strong> ({rowCount} rows)
      </div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 6 }}>
        {[0.1,0.2,0.3].map(d => (
          <div key={d} style={{
            width: 8, height: 8, borderRadius: "50%", background: "var(--accent)",
            animation: `pulse 1.2s ease-in-out ${d}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

function StepReview({ fileName, mappings, setMappings, sampleRows, isOfficer, importMode, setImportMode, members, userId, onNext }) {
  const missing = REQUIRED.filter(f => !mappings.some(m => m.mapped_to === f));
  const hasName = mappings.some(m => m.mapped_to === "archer_name");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Review column mapping</h2>
        <p style={{ opacity: 0.5, fontSize: 13, margin: 0 }}>{fileName} · Claude mapped {mappings.filter(m => m.mapped_to !== "ignore").length} of {mappings.length} columns</p>
      </div>

      <div style={{ border: "1px solid var(--accent-light)", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--accent-light)" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your column</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sample</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Maps to</th>
              <th style={{ padding: "8px 4px", width: 24 }}></th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => {
              const sample = sampleRows.slice(0, 2).map(r => r[m.csv_col]).filter(Boolean).join(", ");
              const color = m.mapped_to === "ignore" ? undefined : confidenceColor(m.confidence);
              return (
                <tr key={m.csv_col} style={{ borderTop: "1px solid var(--accent-light)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{m.csv_col}</td>
                  <td style={{ padding: "8px 12px", opacity: 0.45, fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sample}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <select value={m.mapped_to}
                      onChange={e => setMappings(prev => prev.map((mm, ii) => ii === i ? { ...mm, mapped_to: e.target.value, confidence: 1 } : mm))}
                      style={{ fontSize: 13, padding: "3px 6px", borderRadius: 6, border: `1px solid ${color || "var(--accent-light)"}`, background: "var(--background)", color: "var(--foreground)", width: "100%" }}>
                      {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "center" }}>
                    {m.mapped_to !== "ignore" && (
                      <div title={`${Math.round(m.confidence * 100)}% confidence`}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: color, margin: "0 auto" }} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {missing.length > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 13 }}>
          ⚠️ Required fields missing: <strong>{missing.map(f => FIELD_OPTIONS.find(o => o.value === f)?.label).join(", ")}</strong>
          <div style={{ opacity: 0.7, marginTop: 2, fontSize: 12 }}>Map these columns above before continuing.</div>
        </div>
      )}

      {isOfficer && hasName && (
        <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--accent-light)", background: "color-mix(in srgb, var(--accent) 4%, var(--background))" }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Who is this data for?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { v: "self", label: "Myself only", sub: "All rows imported to my account" },
              { v: "members", label: "Club members", sub: "Match archer names to member profiles" },
            ].map(opt => (
              <label key={opt.v} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "10px 12px", borderRadius: 8, border: `1px solid ${importMode === opt.v ? "var(--accent)" : "var(--accent-light)"}`, background: importMode === opt.v ? "var(--accent-light)" : "transparent" }}>
                <input type="radio" name="importMode" value={opt.v} checked={importMode === opt.v} onChange={() => setImportMode(opt.v)} style={{ marginTop: 2, accentColor: "var(--accent)" }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{opt.sub}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <button onClick={onNext} disabled={missing.length > 0}
        style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: missing.length > 0 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, opacity: missing.length > 0 ? 0.4 : 1, alignSelf: "flex-start" }}>
        {importMode === "members" ? "Match archers →" : "Preview import →"}
      </button>
    </div>
  );
}

function StepNames({ mappedRows, members, nameMatches, setNameMatches, onNext }) {
  const uniqueNames = [...new Set(mappedRows.map(r => r.archer_name).filter(Boolean))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Match archers to members</h2>
        <p style={{ opacity: 0.5, fontSize: 13, margin: 0 }}>{uniqueNames.length} archer{uniqueNames.length !== 1 ? "s" : ""} found in your file</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {uniqueNames.map(name => {
          // Auto-suggest: exact match or starts-with match
          const autoMatch = members.find(m =>
            m.profiles?.full_name?.toLowerCase() === name.toLowerCase() ||
            m.profiles?.full_name?.toLowerCase().startsWith(name.toLowerCase().split(" ")[0])
          );
          const currentVal = nameMatches[name] ?? (autoMatch?.profile_id || "");

          return (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--accent-light)", background: "color-mix(in srgb, var(--accent) 3%, var(--background))" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
                <div style={{ fontSize: 12, opacity: 0.45 }}>
                  {mappedRows.filter(r => r.archer_name === name).length} rows
                </div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.4, padding: "0 4px" }}>→</div>
              <select value={currentVal}
                onChange={e => setNameMatches(prev => ({ ...prev, [name]: e.target.value }))}
                style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: `1px solid ${currentVal ? "var(--accent)" : "#f59e0b"}`, background: "var(--background)", color: "var(--foreground)", minWidth: 180 }}>
                <option value="">— select member —</option>
                <option value="__skip__">Skip / ignore these rows</option>
                {members.map(m => (
                  <option key={m.profile_id} value={m.profile_id}>{m.profiles?.full_name}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {uniqueNames.some(n => !nameMatches[n]) && (
        <div style={{ fontSize: 13, padding: "8px 12px", borderRadius: 8, background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e" }}>
          ⚠️ Match all archers before continuing, or choose "Skip" to exclude those rows.
        </div>
      )}

      <button onClick={onNext} disabled={uniqueNames.some(n => !nameMatches[n])}
        style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: uniqueNames.some(n => !nameMatches[n]) ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, opacity: uniqueNames.some(n => !nameMatches[n]) ? 0.4 : 1, alignSelf: "flex-start" }}>
        Preview import →
      </button>
    </div>
  );
}

function StepPreview({ readyRows, userId, members, onImport, loading }) {
  const totalRows = readyRows.length;
  const uniqueRounds = [...new Set(readyRows.map(r => r.round_name))].sort();
  const profileCounts = {};
  for (const r of readyRows) profileCounts[r.profile_id] = (profileCounts[r.profile_id] || 0) + 1;
  const dates = readyRows.map(r => r.shot_at).filter(Boolean).sort();
  const dateRange = dates.length ? `${dates[0]} → ${dates[dates.length - 1]}` : "—";

  function memberName(pid) {
    if (pid === userId) return "You";
    return members.find(m => m.profile_id === pid)?.profiles?.full_name || pid;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Ready to import</h2>
        <p style={{ opacity: 0.5, fontSize: 13, margin: 0 }}>Review the summary below, then confirm.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Rounds", value: totalRows },
          { label: "Date range", value: dateRange, small: true },
          { label: "Unique rounds", value: uniqueRounds.length },
        ].map(s => (
          <div key={s.label} style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid var(--accent-light)", background: "color-mix(in srgb, var(--accent) 5%, var(--background))" }}>
            <div style={{ fontSize: s.small ? 13 : 22, fontWeight: 700, color: "var(--accent)" }}>{s.value}</div>
            <div style={{ fontSize: 11, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {Object.keys(profileCounts).length > 1 && (
        <div style={{ padding: 12, borderRadius: 10, border: "1px solid var(--accent-light)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Per archer</div>
          {Object.entries(profileCounts).map(([pid, count]) => (
            <div key={pid} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--accent-light)" }}>
              <span>{memberName(pid)}</span>
              <span style={{ fontWeight: 600, color: "var(--accent)" }}>{count} rounds</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: 12, borderRadius: 10, border: "1px solid var(--accent-light)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Round types</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {uniqueRounds.map(r => (
            <span key={r} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: "var(--accent-light)", color: "var(--accent)", fontWeight: 500 }}>{r}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, borderRadius: 10, background: "#f0fdf4", border: "1px solid #86efac", fontSize: 13, color: "#14532d" }}>
        ✓ Exact duplicates (same round, date, and score already in your account) will be skipped automatically.
      </div>

      {/* First 5 rows preview */}
      <div style={{ border: "1px solid var(--accent-light)", borderRadius: 10, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--accent-light)" }}>
              {["Date","Round","Score","Golds","Bow","Classification"].map(h => (
                <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, opacity: 0.6, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {readyRows.slice(0, 5).map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--accent-light)" }}>
                <td style={{ padding: "6px 10px", opacity: 0.7 }}>{r.shot_at}</td>
                <td style={{ padding: "6px 10px", fontWeight: 500 }}>{r.round_name}</td>
                <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{r.score}</td>
                <td style={{ padding: "6px 10px", opacity: 0.7 }}>{r.golds ?? "—"}</td>
                <td style={{ padding: "6px 10px", opacity: 0.7 }}>{r.bow_type ?? "—"}</td>
                <td style={{ padding: "6px 10px", opacity: 0.7 }}>{r.classification ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {readyRows.length > 5 && (
          <div style={{ padding: "6px 10px", fontSize: 12, opacity: 0.4, borderTop: "1px solid var(--accent-light)" }}>
            +{readyRows.length - 5} more rows…
          </div>
        )}
      </div>

      <button onClick={onImport} disabled={loading}
        style={{ padding: "12px 24px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: 15, alignSelf: "flex-start", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Importing…" : `Import ${totalRows} rounds`}
      </button>
    </div>
  );
}

function StepDone({ result, onReset }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "48px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
        {result.imported} round{result.imported !== 1 ? "s" : ""} imported
      </h2>
      <p style={{ opacity: 0.55, fontSize: 14, margin: "0 0 20px" }}>
        {result.skipped > 0 && `${result.skipped} duplicate${result.skipped !== 1 ? "s" : ""} skipped · `}
        Your dashboard has been updated.
      </p>
      {result.errors?.length > 0 && (
        <details style={{ marginBottom: 20, textAlign: "left" }}>
          <summary style={{ fontSize: 13, opacity: 0.5, cursor: "pointer" }}>{result.errors.length} row{result.errors.length !== 1 ? "s" : ""} skipped due to errors</summary>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.5, maxHeight: 120, overflowY: "auto" }}>
            {result.errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        </details>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <a href="/dashboard" style={{ padding: "9px 18px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          View dashboard
        </a>
        <button onClick={onReset}
          style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--accent-light)", background: "none", cursor: "pointer", fontWeight: 500, fontSize: 14, color: "var(--foreground)" }}>
          Import another file
        </button>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const STEPS = ["upload","mapping","review","names","preview","done"];
const STEP_LABELS = { upload:"Upload", mapping:"Reading", review:"Review", names:"Match archers", preview:"Confirm", done:"Done" };

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function ImportWizard({ userId, isOfficer, members }) {
  const [step, setStep]               = useState("upload");
  const [fileName, setFileName]       = useState("");
  const [parsed, setParsed]           = useState(null);   // { headers, rows }
  const [mappings, setMappings]       = useState([]);
  const [importMode, setImportMode]   = useState("self");
  const [nameMatches, setNameMatches] = useState({});
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [globalError, setGlobalError] = useState(null);

  const supabase = createClient();

  // After upload: parse then call AI
  const handleParsed = useCallback(async (parsedData, name) => {
    setParsed(parsedData);
    setFileName(name);
    setStep("mapping");

    try {
      const sampleRows = parsedData.rows.slice(0, 3).map(row =>
        parsedData.headers.map(h => row[h] ?? "")
      );
      const { data, error } = await supabase.functions.invoke("map-import-columns", {
        body: { headers: parsedData.headers, sampleRows },
      });
      if (error) throw error;
      setMappings(data.mappings || []);
    } catch (e) {
      // Fall back to empty mappings — user maps manually
      setMappings(parsedData.headers.map(h => ({ csv_col: h, mapped_to: "ignore", confidence: 0 })));
    }
    setStep("review");
  }, []);

  // Derive mapped rows from current mappings
  function getMappedRows() {
    if (!parsed) return [];
    return parsed.rows.map(row => {
      const out = {};
      for (const m of mappings) {
        if (m.mapped_to !== "ignore") out[m.mapped_to] = row[m.csv_col] ?? "";
      }
      return out;
    });
  }

  // Build final import-ready rows with profile_id
  function getReadyRows() {
    const mapped = getMappedRows();
    if (importMode === "self") {
      return mapped.map(r => ({ ...r, profile_id: userId }));
    }
    return mapped
      .filter(r => nameMatches[r.archer_name] && nameMatches[r.archer_name] !== "__skip__")
      .map(r => ({ ...r, profile_id: nameMatches[r.archer_name] }));
  }

  async function handleImport() {
    setLoading(true);
    setGlobalError(null);
    try {
      const rows = getReadyRows();
      const res = await importRows(rows);
      if (res.error) { setGlobalError(res.error); setLoading(false); return; }
      setResult(res);
      setStep("done");
    } catch (e) {
      setGlobalError(e.message || "Import failed");
    }
    setLoading(false);
  }

  function reset() {
    setStep("upload"); setParsed(null); setFileName(""); setMappings([]);
    setImportMode("self"); setNameMatches({}); setResult(null); setGlobalError(null);
  }

  const stepIdx = STEPS.indexOf(step);
  const visibleSteps = isOfficer ? STEPS : STEPS.filter(s => s !== "names");

  return (
    <div>
      {/* Progress */}
      {step !== "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, overflowX: "auto" }}>
          {visibleSteps.filter(s => s !== "mapping" && s !== "done").map((s, i, arr) => {
            const active = s === step || (step === "mapping" && s === "upload");
            const done = visibleSteps.indexOf(step) > visibleSteps.indexOf(s);
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: done ? "var(--accent)" : active ? "var(--accent)" : "var(--accent-light)",
                    color: done || active ? "var(--accent-foreground)" : "var(--foreground)",
                    opacity: done || active ? 1 : 0.4,
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 10, opacity: active ? 1 : 0.4, whiteSpace: "nowrap", fontWeight: active ? 600 : 400 }}>
                    {STEP_LABELS[s]}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 40, height: 1, background: "var(--accent-light)", margin: "0 4px", marginBottom: 16 }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {globalError && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 13 }}>
          ⚠️ {globalError}
        </div>
      )}

      {step === "upload"  && <StepUpload onParsed={handleParsed} />}
      {step === "mapping" && <StepMapping fileName={fileName} rowCount={parsed?.rows?.length ?? 0} />}
      {step === "review"  && (
        <StepReview
          fileName={fileName}
          mappings={mappings}
          setMappings={setMappings}
          sampleRows={parsed?.rows || []}
          isOfficer={isOfficer}
          importMode={importMode}
          setImportMode={setImportMode}
          members={members}
          userId={userId}
          onNext={() => setStep(importMode === "members" ? "names" : "preview")}
        />
      )}
      {step === "names" && (
        <StepNames
          mappedRows={getMappedRows()}
          members={members}
          nameMatches={nameMatches}
          setNameMatches={setNameMatches}
          onNext={() => setStep("preview")}
        />
      )}
      {step === "preview" && (
        <StepPreview
          readyRows={getReadyRows()}
          userId={userId}
          members={members}
          onImport={handleImport}
          loading={loading}
        />
      )}
      {step === "done" && <StepDone result={result} onReset={reset} />}
    </div>
  );
}
