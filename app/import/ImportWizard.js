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
const CSV_STEPS = ["mode","upload","mapping","review","names","preview","done"];
const SS_STEPS  = ["mode","ss_upload","ss_reading","ss_review","preview","done"];
const CSV_LABELS = { mode:"Method", upload:"Upload", mapping:"Reading", review:"Review", names:"Match archers", preview:"Confirm", done:"Done" };
const SS_LABELS  = { mode:"Method", ss_upload:"Upload", ss_reading:"Reading", ss_review:"Review", preview:"Confirm", done:"Done" };

const BOW_TYPES = ["Recurve","Compound","Barebow","Longbow"];

// ── Mode selector ─────────────────────────────────────────────────────────────
function StepModeSelect({ onCsv, onScreenshots }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Import your scores</h2>
        <p style={{ opacity: 0.55, fontSize: 14, margin: 0 }}>How would you like to bring your data in?</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            icon: "📸", title: "Screenshots from another app",
            sub: "Archer's Toolbox, ArcherySuccess, any app — screenshot your history and Claude reads it. Best for migrating from apps with no export.",
            action: onScreenshots,
          },
          {
            icon: "📄", title: "CSV / spreadsheet file",
            sub: "Export a CSV from your current app or use your own spreadsheet. Claude maps the columns automatically.",
            action: onCsv,
          },
        ].map(opt => (
          <button key={opt.title} onClick={opt.action} style={{
            display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 20px",
            borderRadius: 12, border: "1px solid var(--accent-light)", background: "color-mix(in srgb, var(--accent) 3%, var(--background))",
            cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--accent-light)"}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{opt.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--foreground)" }}>{opt.title}</div>
              <div style={{ fontSize: 13, opacity: 0.55, lineHeight: 1.5 }}>{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Screenshot upload ─────────────────────────────────────────────────────────
function StepScreenshotUpload({ onProcess }) {
  const [images, setImages] = useState([]); // {file, preview}
  const [bowType, setBowType] = useState("");
  const inputRef = useRef();

  function addFiles(files) {
    const newImgs = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs]);
  }

  function remove(i) {
    setImages(prev => prev.filter((_, idx) => idx !== i));
  }

  async function process() {
    // Convert to base64
    const base64s = await Promise.all(images.map(img => new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.onerror = rej;
      reader.readAsDataURL(img.file);
    })));
    onProcess(base64s, bowType);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Upload your screenshots</h2>
        <p style={{ opacity: 0.55, fontSize: 13, margin: 0 }}>
          Screenshot your score <strong>history list</strong> in your app (scroll through and capture each page). Optionally add individual round screenshots for full arrow detail.
        </p>
      </div>

      {/* Tips */}
      <div style={{ padding: 12, borderRadius: 10, background: "var(--accent-light)", fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>💡 Tips for best results</div>
        <div style={{ opacity: 0.7 }}>1. In Archer's Toolbox, go to <strong>Score History</strong> and screenshot each page of the list — this gives dates + totals for all rounds</div>
        <div style={{ opacity: 0.7 }}>2. Optionally open individual rounds and screenshot them for full end-by-end arrow detail</div>
        <div style={{ opacity: 0.7 }}>3. Upload everything at once — Claude figures out which is which and stitches them together</div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        style={{
          border: "2px dashed var(--accent-light)", borderRadius: 12,
          padding: images.length ? "16px" : "40px 20px",
          textAlign: images.length ? "left" : "center", cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--accent-light)"}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)} />

        {images.length === 0 ? (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop screenshots here</div>
            <div style={{ fontSize: 13, opacity: 0.5 }}>or tap to choose — select multiple at once</div>
          </>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={img.preview} alt={`Screenshot ${i+1}`}
                  style={{ height: 120, borderRadius: 8, objectFit: "cover", display: "block" }} />
                <button onClick={e => { e.stopPropagation(); remove(i); }}
                  style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "#dc2626", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ×
                </button>
              </div>
            ))}
            <div style={{ height: 120, width: 80, borderRadius: 8, border: "2px dashed var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, opacity: 0.4, cursor: "pointer" }}>+</div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div style={{ fontSize: 13, opacity: 0.5 }}>{images.length} screenshot{images.length !== 1 ? "s" : ""} ready</div>
      )}

      {/* Bow type — ask once */}
      <div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
          What bow type were these scores shot with?
          <select value={bowType} onChange={e => setBowType(e.target.value)}
            style={{ fontSize: 14, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)", maxWidth: 220 }}>
            <option value="">— select —</option>
            {BOW_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <span style={{ fontWeight: 400, opacity: 0.5 }}>Applied to all imported scores. You can change individual ones in the next step.</span>
        </label>
      </div>

      <button onClick={process} disabled={images.length === 0 || !bowType}
        style={{
          padding: "11px 22px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)",
          border: "none", cursor: images.length === 0 || !bowType ? "not-allowed" : "pointer",
          fontWeight: 700, fontSize: 14, opacity: images.length === 0 || !bowType ? 0.4 : 1, alignSelf: "flex-start",
        }}>
        Read with Claude →
      </button>
    </div>
  );
}

// ── Screenshot review ─────────────────────────────────────────────────────────
function StepScreenshotReview({ scores, setScores, bowType, onNext }) {
  const missingDates = scores.filter(s => !s.date).length;
  const [bulkDate, setBulkDate] = useState("");

  function updateRow(i, field, val) {
    setScores(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }
  function removeRow(i) {
    setScores(prev => prev.filter((_, idx) => idx !== i));
  }
  function applyBulkDate() {
    if (!bulkDate) return;
    setScores(prev => prev.map(s => s.date ? s : { ...s, date: bulkDate }));
  }
  function applyBulkDateAll() {
    if (!bulkDate) return;
    setScores(prev => prev.map(s => ({ ...s, date: bulkDate })));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Review extracted scores</h2>
        <p style={{ opacity: 0.55, fontSize: 13, margin: 0 }}>
          {scores.length} rounds found · {missingDates > 0 ? `${missingDates} missing dates — fill these in below` : "All dates found ✓"}
        </p>
      </div>

      {missingDates > 0 && (
        <>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e", fontSize: 13, lineHeight: 1.5 }}>
            <strong>Dates could not be extracted</strong> — this usually means you only uploaded individual round screens without the history list. The history list (showing all your rounds grouped by date) is needed for dates to be picked up automatically.
            <br />You can fill in dates individually below, or use the bulk tool to set them all at once.
          </div>

          {/* Bulk date setter */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Set date for missing rounds:</span>
            <input
              type="date"
              value={bulkDate}
              onChange={e => setBulkDate(e.target.value)}
              style={{ fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            />
            <button onClick={applyBulkDate} disabled={!bulkDate}
              style={{ fontSize: 13, padding: "5px 12px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: bulkDate ? "pointer" : "not-allowed", fontWeight: 600, opacity: bulkDate ? 1 : 0.4 }}>
              Apply to missing ({missingDates})
            </button>
            <button onClick={applyBulkDateAll} disabled={!bulkDate}
              style={{ fontSize: 13, padding: "5px 12px", borderRadius: 6, background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", cursor: bulkDate ? "pointer" : "not-allowed", opacity: bulkDate ? 1 : 0.4 }}>
              Apply to all
            </button>
          </div>
        </>
      )}

      <div style={{ border: "1px solid var(--accent-light)", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--accent-light)" }}>
              {["Round","Date","Score","Golds","Detail",""].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--accent-light)", background: !s.date ? "rgba(245,158,11,0.05)" : "transparent" }}>
                <td style={{ padding: "6px 10px" }}>
                  <input value={s.round_name || ""} onChange={e => updateRow(i, "round_name", e.target.value)}
                    style={{ fontSize: 13, padding: "3px 6px", borderRadius: 5, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)", width: 130 }} />
                </td>
                <td style={{ padding: "6px 10px" }}>
                  <input type="date" value={s.date || ""} onChange={e => updateRow(i, "date", e.target.value)}
                    style={{ fontSize: 13, padding: "3px 6px", borderRadius: 5, border: `1px solid ${!s.date ? "#f59e0b" : "var(--accent-light)"}`, background: "var(--background)", color: "var(--foreground)" }} />
                </td>
                <td style={{ padding: "6px 10px", fontWeight: 700, color: "var(--accent)" }}>{s.score}</td>
                <td style={{ padding: "6px 10px", opacity: 0.6 }}>{s.golds ?? "—"}</td>
                <td style={{ padding: "6px 10px" }}>
                  {s.has_detail
                    ? <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>✓ {s.arrows?.length} arrows</span>
                    : <span style={{ fontSize: 11, opacity: 0.35 }}>totals only</span>}
                </td>
                <td style={{ padding: "6px 6px" }}>
                  <button onClick={() => removeRow(i)}
                    style={{ fontSize: 14, color: "#dc2626", background: "none", border: "none", cursor: "pointer", opacity: 0.5, padding: 0 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={onNext} disabled={missingDates > 0 || scores.length === 0}
        style={{
          padding: "10px 20px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)",
          border: "none", cursor: missingDates > 0 || scores.length === 0 ? "not-allowed" : "pointer",
          fontWeight: 600, fontSize: 14, opacity: missingDates > 0 || scores.length === 0 ? 0.4 : 1, alignSelf: "flex-start",
        }}>
        Preview import →
      </button>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function ImportWizard({ userId, isOfficer, members }) {
  const [step, setStep]                   = useState("mode");
  const [source, setSource]               = useState(null); // "csv" | "screenshots"
  // CSV flow
  const [fileName, setFileName]           = useState("");
  const [parsed, setParsed]               = useState(null);
  const [mappings, setMappings]           = useState([]);
  const [importMode, setImportMode]       = useState("self");
  const [nameMatches, setNameMatches]     = useState({});
  // Screenshot flow
  const [ssScores, setSsScores]           = useState([]);
  const [ssBowType, setSsBowType]         = useState("");
  // Shared
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [globalError, setGlobalError]     = useState(null);

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

  // Screenshot: call edge function then go to review
  async function handleScreenshotProcess(base64s, bowType) {
    setSsBowType(bowType);
    setStep("ss_reading");
    setGlobalError(null);
    try {
      const { data, error } = await supabase.functions.invoke("parse-screenshot-scores", {
        body: { images: base64s },
      });
      if (error) throw error;
      setSsScores(data.scores || []);
      setStep("ss_review");
    } catch (e) {
      setGlobalError(e.message || "Failed to read screenshots");
      setStep("ss_upload");
    }
  }

  // Build final import-ready rows with profile_id
  function getReadyRows() {
    if (source === "screenshots") {
      return ssScores
        .filter(s => s.date && s.round_name && s.score)
        .map(s => ({
          profile_id:  userId,
          round_name:  s.round_name,
          score:       parseInt(s.score),
          golds:       s.golds != null ? parseInt(s.golds) : null,
          shot_at:     s.date,
          bow_type:    ssBowType || null,
          age_category: null,
          classification: null,
        }));
    }
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
    setStep("mode"); setSource(null); setParsed(null); setFileName(""); setMappings([]);
    setImportMode("self"); setNameMatches({}); setSsScores([]); setSsBowType("");
    setResult(null); setGlobalError(null);
  }

  const STEPS      = source === "screenshots" ? SS_STEPS : CSV_STEPS;
  const STEP_LABELS = source === "screenshots" ? SS_LABELS : CSV_LABELS;
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

      {step === "mode" && (
        <StepModeSelect
          onCsv={() => { setSource("csv"); setStep("upload"); }}
          onScreenshots={() => { setSource("screenshots"); setStep("ss_upload"); }}
        />
      )}

      {/* ── Screenshot flow ── */}
      {step === "ss_upload" && (
        <StepScreenshotUpload onProcess={handleScreenshotProcess} />
      )}
      {step === "ss_reading" && (
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Reading your screenshots…</div>
          <div style={{ opacity: 0.5, fontSize: 14 }}>Claude is extracting scores and stitching detail views together</div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 6 }}>
            {[0.1,0.2,0.3].map(d => (
              <div key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}
      {step === "ss_review" && (
        <StepScreenshotReview
          scores={ssScores}
          setScores={setSsScores}
          bowType={ssBowType}
          onNext={() => setStep("preview")}
        />
      )}

      {/* ── CSV flow ── */}
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

      {/* ── Shared ── */}
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
