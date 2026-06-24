"use client";

import { useState } from "react";
import { saveSetup, deleteSetup, saveSightMarks, saveCrawlMarks, saveArrowSet, deleteArrowSet } from "./actions";
import { ROUNDS } from "@/lib/rounds";
import EquipmentPicker from "./EquipmentPicker";

const BOW_TYPES = ["Recurve", "Compound", "Barebow", "Longbow"];
const BOW_ICON = { Recurve: "🏹", Compound: "⚙️", Barebow: "🎯", Longbow: "🌲" };

// Extract individual distances from a round's distance string (e.g. "100/80/60 yd" → ["100 yd","80 yd","60 yd"])
function roundDistances(roundName) {
  const r = ROUNDS[roundName];
  if (!r) return [];
  const parts = r.distance.split("/").map(s => s.trim());
  const unit = parts[parts.length - 1].replace(/^[\d.]+\s*/, "");
  return parts.map(p => {
    const num = p.replace(/[^\d.]/g, "");
    return `${num} ${unit}`;
  });
}

const ROUND_NAMES = Object.keys(ROUNDS).sort();

// What equipment each bow type supports
const EQUIP = {
  Recurve:  { sight: true, clicker: true, button: true, tab: true, sling: true, stabilisers: true, release_aid: false, scope: false, crawl: false, riser_weights: true },
  Compound: { sight: true, clicker: true, button: true, tab: false, sling: true, stabilisers: true, release_aid: true, scope: true, crawl: false, riser_weights: true },
  Barebow:  { sight: false, clicker: false, button: true, tab: true, sling: true, stabilisers: false, release_aid: false, scope: false, crawl: true, riser_weights: true },
  Longbow:  { sight: false, clicker: false, button: false, tab: true, sling: false, stabilisers: false, release_aid: false, scope: false, crawl: true, riser_weights: false },
};

function Field({ label, value, onChange, placeholder, type = "text", width }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12 }}>
      <span style={{ fontWeight: 600, opacity: 0.6 }}>{label}</span>
      <input type={type} value={value ?? ""} onChange={e => onChange(type === "number" ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value)}
        placeholder={placeholder}
        style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: width || "100%" }} />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12 }}>
      <span style={{ fontWeight: 600, opacity: 0.6 }}>{label}</span>
      <select value={value ?? ""} onChange={e => onChange(e.target.value || null)}
        style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
        <option value="">{placeholder || "—"}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "10px 14px", background: "var(--card)", border: "none",
        cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 14, fontWeight: 600, color: "var(--foreground)",
      }}>
        {title}
        <span style={{ opacity: 0.4, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>}
    </div>
  );
}

// ── Sight Marks Editor ──
function SightMarksEditor({ marks, setMarks }) {
  const [roundPick, setRoundPick] = useState("");

  function update(i, field, val) {
    setMarks(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }
  function addRow() { setMarks(prev => [...prev, { distance: "", sight_number: null, extension_bar: null, notes: "" }]); }
  function removeRow(i) { setMarks(prev => prev.filter((_, idx) => idx !== i)); }

  function addFromRound() {
    if (!roundPick) return;
    const distances = roundDistances(roundPick);
    setMarks(prev => {
      const existing = new Set(prev.map(m => m.distance));
      const newRows = distances.filter(d => !existing.has(d)).map(d => {
        const similar = prev.find(m => m.distance === d);
        return { distance: d, sight_number: similar?.sight_number ?? null, extension_bar: similar?.extension_bar ?? null, notes: "" };
      });
      return [...prev, ...newRows];
    });
    setRoundPick("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {marks.map((m, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
          <Field label="Distance" value={m.distance} onChange={v => update(i, "distance", v)} placeholder="20 yd" width={80} />
          <Field label="Sight #" value={m.sight_number} onChange={v => update(i, "sight_number", v)} type="number" width={70} />
          <Field label="Ext. bar" value={m.extension_bar} onChange={v => update(i, "extension_bar", v)} type="number" width={60} />
          <Field label="Notes" value={m.notes} onChange={v => update(i, "notes", v)} placeholder="" width={100} />
          <button onClick={() => removeRow(i)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "#dc2626", marginBottom: 2 }}>×</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
        <button onClick={addRow} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px dashed var(--border)", background: "transparent", cursor: "pointer", color: "var(--foreground)" }}>
          + Add distance
        </button>
        <div style={{ display: "flex", gap: 4, alignItems: "end" }}>
          <select value={roundPick} onChange={e => setRoundPick(e.target.value)}
            style={{ fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
            <option value="">Add from round…</option>
            {ROUND_NAMES.map(r => <option key={r} value={r}>{r} — {ROUNDS[r].distance}</option>)}
          </select>
          {roundPick && <button onClick={addFromRound} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>Add</button>}
        </div>
      </div>
    </div>
  );
}

// ── Crawl Marks Editor ──
function CrawlMarksEditor({ marks, setMarks }) {
  const [roundPick, setRoundPick] = useState("");

  function update(i, field, val) {
    setMarks(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }
  function addRow() { setMarks(prev => [...prev, { distance: "", finger_position: "3 under", anchor: "chin", tab_count: null, notes: "" }]); }
  function removeRow(i) { setMarks(prev => prev.filter((_, idx) => idx !== i)); }

  function addFromRound() {
    if (!roundPick) return;
    const distances = roundDistances(roundPick);
    setMarks(prev => {
      const existing = new Set(prev.map(m => m.distance));
      const newRows = distances.filter(d => !existing.has(d)).map(d => {
        const similar = prev.find(m => m.distance === d);
        return {
          distance: d,
          finger_position: similar?.finger_position ?? "3 under",
          anchor: similar?.anchor ?? "chin",
          tab_count: similar?.tab_count ?? null,
          notes: "",
        };
      });
      return [...prev, ...newRows];
    });
    setRoundPick("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {marks.map((m, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
          <Field label="Distance" value={m.distance} onChange={v => update(i, "distance", v)} placeholder="20 yd" width={80} />
          <Select label="Fingers" value={m.finger_position} onChange={v => update(i, "finger_position", v)} options={["3 under", "split"]} />
          <Select label="Anchor" value={m.anchor} onChange={v => update(i, "anchor", v)} options={["lip", "chin"]} />
          <Field label="Tab count" value={m.tab_count} onChange={v => update(i, "tab_count", v)} type="number" width={70} />
          <Field label="Notes" value={m.notes} onChange={v => update(i, "notes", v)} width={100} />
          <button onClick={() => removeRow(i)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "#dc2626", marginBottom: 2 }}>×</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
        <button onClick={addRow} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px dashed var(--border)", background: "transparent", cursor: "pointer", color: "var(--foreground)" }}>
          + Add distance
        </button>
        <div style={{ display: "flex", gap: 4, alignItems: "end" }}>
          <select value={roundPick} onChange={e => setRoundPick(e.target.value)}
            style={{ fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
            <option value="">Add from round…</option>
            {ROUND_NAMES.map(r => <option key={r} value={r}>{r} — {ROUNDS[r].distance}</option>)}
          </select>
          {roundPick && <button onClick={addFromRound} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>Add</button>}
        </div>
      </div>
    </div>
  );
}

// ── Arrow Set Editor ──
function ArrowSetEditor({ arrows, setupId }) {
  const [sets, setSets] = useState(arrows);
  const [saving, setSaving] = useState(false);

  async function save(arrow) {
    setSaving(true);
    const res = await saveArrowSet(setupId, arrow);
    if (res.data) setSets(prev => prev.some(a => a.id === res.data.id) ? prev.map(a => a.id === res.data.id ? res.data : a) : [...prev, res.data]);
    setSaving(false);
  }
  async function remove(id) {
    await deleteArrowSet(id);
    setSets(prev => prev.filter(a => a.id !== id));
  }
  function addNew() {
    setSets(prev => [...prev, { _new: true, name: "", spine: "", length: "", point_weight: "", fletching: "", nock: "", clicker_offset: null, is_active: false }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sets.map((a, i) => (
        <div key={a.id || `new-${i}`} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Field label="Name" value={a.name} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Easton X10 600" width={160} />
            <Field label="Spine" value={a.spine} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, spine: v } : x))} placeholder="600" width={70} />
            <Field label="Length" value={a.length} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, length: v } : x))} placeholder='28"' width={70} />
            <Field label="Points" value={a.point_weight} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, point_weight: v } : x))} placeholder="100gr" width={70} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Field label="Fletching" value={a.fletching} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, fletching: v } : x))} placeholder="Spin Wings" width={120} />
            <Field label="Nock" value={a.nock} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, nock: v } : x))} placeholder="Pin nock" width={100} />
            <Field label="Clicker offset" value={a.clicker_offset} onChange={v => setSets(p => p.map((x, j) => j === i ? { ...x, clicker_offset: v } : x))} type="number" width={80} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}>
              <input type="checkbox" checked={a.is_active ?? false} onChange={e => setSets(p => p.map((x, j) => j === i ? { ...x, is_active: e.target.checked } : x))} style={{ accentColor: "var(--accent)" }} />
              Active set
            </label>
            <button onClick={() => save(a)} disabled={saving}
              style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Save
            </button>
            {a.id && <button onClick={() => remove(a.id)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "#dc2626" }}>Delete</button>}
          </div>
        </div>
      ))}
      <button onClick={addNew} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px dashed var(--border)", background: "transparent", cursor: "pointer", color: "var(--foreground)", alignSelf: "flex-start" }}>
        + Add arrow set
      </button>
    </div>
  );
}

// ── Stabiliser Editor ──
function StabiliserEditor({ value, onChange }) {
  const s = value || {};
  const lr = s.long_rod || {};
  const sr = s.short_rods || {};
  const vb = s.v_bar || {};
  const rw = s.riser_weights || [];

  function set(path, val) {
    const next = { ...s };
    if (path.startsWith("long_rod.")) next.long_rod = { ...lr, [path.split(".")[1]]: val };
    else if (path.startsWith("short_rods.")) next.short_rods = { ...sr, [path.split(".")[1]]: val };
    else if (path.startsWith("v_bar.")) next.v_bar = { ...vb, [path.split(".")[1]]: val };
    onChange(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5 }}>Long rod</div>
      <div style={{ display: "flex", gap: 8 }}>
        <Field label='Length (")' value={lr.length} onChange={v => set("long_rod.length", v)} width={80} />
        <Field label="Tip weight (oz)" value={lr.weight} onChange={v => set("long_rod.weight", v)} width={100} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5 }}>Short rods</div>
      <div style={{ display: "flex", gap: 8 }}>
        <Field label='Length (")' value={sr.length} onChange={v => set("short_rods.length", v)} width={80} />
        <Field label="Tip weight (oz)" value={sr.weight} onChange={v => set("short_rods.weight", v)} width={100} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5 }}>V-bar</div>
      <div style={{ display: "flex", gap: 8 }}>
        <Field label="Angle" value={vb.angle} onChange={v => set("v_bar.angle", v)} width={80} />
        <Select label="Dampers" value={vb.dampers} onChange={v => set("v_bar.dampers", v)} options={["Yes", "No"]} />
      </div>
    </div>
  );
}

// ── Setup Card (single bow setup) ──
function SetupCard({ setup: initial, sightMarks: initSM, crawlMarks: initCM, arrowSets, onDelete }) {
  const [setup, setSetup] = useState(initial);
  const [sMarks, setSMarks] = useState(initSM);
  const [cMarks, setCMarks] = useState(initCM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const eq = EQUIP[setup.bow_type] || {};

  function u(field, val) { setSetup(prev => ({ ...prev, [field]: val })); }
  function uJson(field, key, val) {
    setSetup(prev => ({ ...prev, [field]: { ...(prev[field] || {}), [key]: val } }));
  }

  async function save() {
    setSaving(true); setMsg(null);
    const res = await saveSetup(setup);
    if (res.error) { setMsg(res.error); setSaving(false); return; }
    setSetup(res.data);

    if (eq.sight && sMarks.length > 0) await saveSightMarks(res.data.id, sMarks);
    if (eq.crawl && cMarks.length > 0) await saveCrawlMarks(res.data.id, cMarks);

    setMsg("Saved ✓");
    setSaving(false);
    setTimeout(() => setMsg(null), 2000);
  }

  return (
    <div style={{ border: "2px solid var(--border)", borderRadius: 14, overflow: "hidden", background: "var(--card)" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{BOW_ICON[setup.bow_type]}</span>
          <div>
            <input value={setup.name} onChange={e => u("name", e.target.value)}
              style={{ fontSize: 16, fontWeight: 700, border: "none", background: "transparent", color: "var(--foreground)", width: 200, padding: 0 }} />
            <div style={{ fontSize: 12, opacity: 0.5 }}>{setup.bow_type}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label title="Setup colour" style={{ position: "relative", cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: setup.colour || "var(--accent)", border: "2px solid var(--border)" }} />
            <input type="color" value={setup.colour || "#1a6bbf"} onChange={e => u("colour", e.target.value)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} />
          </label>
          {setup.is_active && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: setup.colour || "var(--accent)", color: "#fff", fontWeight: 600 }}>Active</span>}
          <label style={{ fontSize: 11, display: "flex", gap: 4, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={setup.is_active ?? false} onChange={e => u("is_active", e.target.checked)} style={{ accentColor: setup.colour || "var(--accent)" }} />
            Active
          </label>
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Riser */}
        <Section title="Riser">
          <EquipmentPicker category="riser" value={setup.riser_equip || {}} onChange={v => u("riser_equip", v)} placeholder="Hoyt" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <Field label='Length (")' value={setup.riser_length} onChange={v => u("riser_length", v)} placeholder='25"' width={70} />
            <Select label="Bow type" value={setup.bow_type} onChange={v => u("bow_type", v)} options={BOW_TYPES} />
            <Field label="Draw length" value={setup.draw_length} onChange={v => u("draw_length", v)} placeholder='28"' width={70} />
          </div>
        </Section>

        {/* Limbs */}
        <Section title="Limbs" defaultOpen={false}>
          <EquipmentPicker category="limbs" value={setup.limbs_equip || {}} onChange={v => u("limbs_equip", v)} placeholder="Win&Win" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <Select label="Material" value={setup.limbs_material} onChange={v => u("limbs_material", v)} options={["Carbon", "Carbon/Foam", "Carbon/Wood", "Wood", "Fibreglass", "Bamboo"]} placeholder="Select..." />
            <Field label='Length (")' value={setup.limbs_length} onChange={v => u("limbs_length", v)} placeholder='68"' width={70} />
            <Field label="Draw weight" value={setup.draw_weight} onChange={v => u("draw_weight", v)} placeholder="38 lbs" width={90} />
          </div>
        </Section>

        {/* Sight (Recurve, Compound) */}
        {eq.sight && (
          <Section title="Sight" defaultOpen={false}>
            <EquipmentPicker category="sight" value={setup.sight || {}} onChange={v => u("sight", { ...(setup.sight || {}), ...v })} placeholder="Shibuya" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Field label="Pin" value={setup.sight?.pin} onChange={v => uJson("sight", "pin", v)} placeholder="Fibre .019" width={120} />
            </div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Sight marks</div>
            <SightMarksEditor marks={sMarks} setMarks={setSMarks} />
          </Section>
        )}

        {/* Crawl marks (Barebow, Longbow) */}
        {eq.crawl && (
          <Section title="Crawl Marks" defaultOpen={false}>
            <CrawlMarksEditor marks={cMarks} setMarks={setCMarks} />
          </Section>
        )}

        {/* Scope (Compound) */}
        {eq.scope && (
          <Section title="Scope / Lens" defaultOpen={false}>
            <div style={{ display: "flex", gap: 8 }}>
              <Field label="Magnification" value={setup.scope?.magnification} onChange={v => uJson("scope", "magnification", v)} placeholder="4x" width={80} />
              <Field label="Housing size" value={setup.scope?.housing_size} onChange={v => uJson("scope", "housing_size", v)} placeholder="29mm" width={80} />
            </div>
          </Section>
        )}

        {/* Button / Plunger */}
        {eq.button && (
          <Section title="Button / Plunger" defaultOpen={false}>
            <EquipmentPicker category="button" value={setup.button || {}} onChange={v => u("button", { ...(setup.button || {}), ...v })} placeholder="Beiter" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Field label="Spring" value={setup.button?.spring} onChange={v => uJson("button", "spring", v)} placeholder="Medium, 3 clicks" width={130} />
              <Field label="Position" value={setup.button?.position} onChange={v => uJson("button", "position", v)} placeholder="4.5 turns" width={100} />
              <Field label="Tip type" value={setup.button?.tip_type} onChange={v => uJson("button", "tip_type", v)} placeholder="Standard" width={100} />
            </div>
          </Section>
        )}

        {/* Clicker */}
        {eq.clicker && (
          <Section title="Clicker" defaultOpen={false}>
            <EquipmentPicker category="clicker" value={setup.clicker || {}} onChange={v => u("clicker", { ...(setup.clicker || {}), ...v })} placeholder="Shibuya" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Select label="Type" value={setup.clicker?.type} onChange={v => uJson("clicker", "type", v)} options={["Blade", "Magnetic"]} />
              <Field label="Position (mm)" value={setup.clicker?.position} onChange={v => uJson("clicker", "position", v)} width={80} />
            </div>
          </Section>
        )}

        {/* Arrow rest */}
        <Section title="Arrow Rest" defaultOpen={false}>
          <EquipmentPicker category="arrow_rest" value={setup.arrow_rest || {}} onChange={v => u("arrow_rest", { ...(setup.arrow_rest || {}), ...v })} placeholder="Shibuya" />
        </Section>

        {/* Release aid (Compound) */}
        {eq.release_aid && (
          <Section title="Release Aid" defaultOpen={false}>
            <EquipmentPicker category="release_aid" value={setup.release_aid || {}} onChange={v => u("release_aid", { ...(setup.release_aid || {}), ...v })} placeholder="Carter" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Select label="Type" value={setup.release_aid?.type} onChange={v => uJson("release_aid", "type", v)} options={["Thumb", "Hinge", "Tension", "Wrist"]} />
            </div>
          </Section>
        )}

        {/* Scope (Compound) */}
        {eq.scope && (
          <Section title="Scope / Lens" defaultOpen={false}>
            <EquipmentPicker category="scope" value={setup.scope || {}} onChange={v => u("scope", { ...(setup.scope || {}), ...v })} placeholder="Axcel" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Field label="Magnification" value={setup.scope?.magnification} onChange={v => uJson("scope", "magnification", v)} placeholder="4x" width={80} />
              <Field label="Housing size" value={setup.scope?.housing_size} onChange={v => uJson("scope", "housing_size", v)} placeholder="29mm" width={80} />
            </div>
          </Section>
        )}

        {/* Tab (Recurve, Barebow, Longbow) */}
        {eq.tab && (
          <Section title="Tab" defaultOpen={false}>
            <EquipmentPicker category="tab" value={setup.tab || {}} onChange={v => u("tab", { ...(setup.tab || {}), ...v })} placeholder="AAE" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <Field label="Size" value={setup.tab?.size} onChange={v => uJson("tab", "size", v)} placeholder="L" width={50} />
              <Select label="Finger spacer" value={setup.tab?.finger_spacer} onChange={v => uJson("tab", "finger_spacer", v)} options={["Yes", "No"]} />
              <Field label="Plate material" value={setup.tab?.plate_material} onChange={v => uJson("tab", "plate_material", v)} placeholder="Cordovan" width={100} />
            </div>
          </Section>
        )}

        {/* Sling */}
        {eq.sling && (
          <Section title="Sling" defaultOpen={false}>
            <EquipmentPicker category="sling" value={setup.sling || {}} onChange={v => u("sling", { ...(setup.sling || {}), ...v })} placeholder="Beiter" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Select label="Type" value={setup.sling?.type} onChange={v => uJson("sling", "type", v)} options={["Finger sling", "Bow sling"]} />
            </div>
          </Section>
        )}

        {/* String */}
        <Section title="String" defaultOpen={false}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Field label="Material" value={setup.string?.material} onChange={v => u("string", { ...(setup.string || {}), material: v })} placeholder="BCY 8125" width={120} />
            <Field label="Strand count" value={setup.string?.strands} onChange={v => u("string", { ...(setup.string || {}), strands: v })} placeholder="18" width={70} />
            <Field label="String maker" value={setup.string?.maker} onChange={v => u("string", { ...(setup.string || {}), maker: v })} placeholder="" width={120} />
          </div>
        </Section>

        {/* Stabilisers (Recurve, Compound) */}
        {eq.stabilisers && (
          <Section title="Stabilisers" defaultOpen={false}>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 4 }}>Long rod</div>
            <EquipmentPicker category="stabiliser" value={setup.stabilisers?.long_rod_equip || {}} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), long_rod_equip: v })} placeholder="Doinker" />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Field label='Length (")' value={setup.stabilisers?.long_rod?.length} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), long_rod: { ...(setup.stabilisers?.long_rod || {}), length: v } })} width={70} />
              <Field label="Tip weight (oz)" value={setup.stabilisers?.long_rod?.weight} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), long_rod: { ...(setup.stabilisers?.long_rod || {}), weight: v } })} width={90} />
              <Select label="Damper" value={setup.stabilisers?.long_rod?.damper} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), long_rod: { ...(setup.stabilisers?.long_rod || {}), damper: v } })} options={["Yes", "No"]} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginTop: 12, marginBottom: 4 }}>Side rods</div>
            <EquipmentPicker category="stabiliser" value={setup.stabilisers?.side_rod_equip || {}} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), side_rod_equip: v })} placeholder="Doinker" />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Field label='Length (")' value={setup.stabilisers?.short_rods?.length} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), short_rods: { ...(setup.stabilisers?.short_rods || {}), length: v } })} width={70} />
              <Field label="Tip weight (oz)" value={setup.stabilisers?.short_rods?.weight} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), short_rods: { ...(setup.stabilisers?.short_rods || {}), weight: v } })} width={90} />
              <Select label="Damper" value={setup.stabilisers?.short_rods?.damper} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), short_rods: { ...(setup.stabilisers?.short_rods || {}), damper: v } })} options={["Yes", "No"]} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginTop: 12, marginBottom: 4 }}>V-bar</div>
            <EquipmentPicker category="v_bar" value={setup.stabilisers?.v_bar_equip || {}} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), v_bar_equip: v })} placeholder="Doinker" />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Field label="Angle" value={setup.stabilisers?.v_bar?.angle} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), v_bar: { ...(setup.stabilisers?.v_bar || {}), angle: v } })} width={70} />
              <Select label="Adjustable" value={setup.stabilisers?.v_bar?.adjustable} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), v_bar: { ...(setup.stabilisers?.v_bar || {}), adjustable: v } })} options={["Yes", "No"]} />
              <Select label="Dampers" value={setup.stabilisers?.v_bar?.dampers} onChange={v => u("stabilisers", { ...(setup.stabilisers || {}), v_bar: { ...(setup.stabilisers?.v_bar || {}), dampers: v } })} options={["Yes", "No"]} />
            </div>
          </Section>
        )}

        {/* Riser weights */}
        {eq.riser_weights && (
          <Section title="Riser Weights" defaultOpen={false}>
            {(setup.riser_weights_list || []).map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "end", marginBottom: 6 }}>
                <Select label="Position" value={w.position} onChange={v => { const list = [...(setup.riser_weights_list || [])]; list[i] = { ...w, position: v }; u("riser_weights_list", list); }} options={["Top", "Upper", "Middle", "Lower", "Bottom", "Back top", "Back middle", "Back bottom"]} />
                <Field label="Weight (oz)" value={w.weight} onChange={v => { const list = [...(setup.riser_weights_list || [])]; list[i] = { ...w, weight: v }; u("riser_weights_list", list); }} width={80} />
                <Field label="Material" value={w.material} onChange={v => { const list = [...(setup.riser_weights_list || [])]; list[i] = { ...w, material: v }; u("riser_weights_list", list); }} placeholder="Stainless" width={90} />
                <button onClick={() => u("riser_weights_list", (setup.riser_weights_list || []).filter((_, j) => j !== i))} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "#dc2626", marginBottom: 2 }}>×</button>
              </div>
            ))}
            <button onClick={() => u("riser_weights_list", [...(setup.riser_weights_list || []), { position: "Bottom", weight: "", material: "" }])} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "1px dashed var(--border)", background: "transparent", cursor: "pointer", color: "var(--foreground)" }}>
              + Add weight
            </button>
          </Section>
        )}

        {/* Arrows */}
        <Section title="Arrows" defaultOpen={false}>
          <ArrowSetEditor arrows={arrowSets} setupId={setup.id} />
        </Section>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 8 }}>
          <button onClick={save} disabled={saving}
            style={{ padding: "8px 20px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: saving ? "wait" : "pointer", fontWeight: 700, fontSize: 14 }}>
            {saving ? "Saving…" : "Save setup"}
          </button>
          {setup.id && (
            <button onClick={() => { if (confirm("Delete this setup?")) { onDelete(setup.id); } }}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #dc2626", background: "transparent", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>
              Delete
            </button>
          )}
          {msg && <span style={{ fontSize: 13, color: msg.includes("✓") ? "var(--accent)" : "#dc2626" }}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Main Manager ──
export default function SetupManager({ setups: initial, sightMarks, crawlMarks, arrowSets }) {
  const [setups, setSetups] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("Recurve");

  async function handleDelete(id) {
    await deleteSetup(id);
    setSetups(prev => prev.filter(s => s.id !== id));
  }

  function addNew() {
    setSetups(prev => [...prev, {
      _new: true, name: `My ${newType}`, bow_type: newType, is_active: prev.length === 0,
      riser: "", limbs: "", draw_weight: "", draw_length: "",
    }]);
    setAdding(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {setups.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "40px 20px", opacity: 0.5 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏹</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No setups yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Create your first bow setup to track your equipment and sight marks.</div>
        </div>
      )}

      {setups.map((s, i) => (
        <SetupCard
          key={s.id || `new-${i}`}
          setup={s}
          sightMarks={sightMarks.filter(m => m.setup_id === s.id)}
          crawlMarks={crawlMarks.filter(m => m.setup_id === s.id)}
          arrowSets={arrowSets.filter(a => a.setup_id === s.id)}
          onDelete={handleDelete}
        />
      ))}

      {adding ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 16px", border: "1px dashed var(--border)", borderRadius: 10 }}>
          <Select label="Bow type" value={newType} onChange={v => setNewType(v)} options={BOW_TYPES} />
          <button onClick={addNew} style={{ padding: "6px 16px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, marginTop: 18 }}>
            Create
          </button>
          <button onClick={() => setAdding(false)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: 13, marginTop: 18 }}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{
          padding: "12px 20px", borderRadius: 10, border: "2px dashed var(--border)",
          background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600,
          color: "var(--foreground)", opacity: 0.7,
        }}>
          + New bow setup
        </button>
      )}
    </div>
  );
}
