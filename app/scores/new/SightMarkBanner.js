"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROUNDS } from "@/lib/rounds";

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

export default function SightMarkBanner({ roundName, bowType }) {
  const [marks, setMarks] = useState(null);
  const [setupId, setSetupId] = useState(null);
  const [isCrawl, setIsCrawl] = useState(false);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!roundName || !bowType) { setMarks(null); return; }
    loadMarks();
  }, [roundName, bowType]);

  async function loadMarks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: setups } = await supabase
      .from("bow_setups")
      .select("id, bow_type")
      .eq("profile_id", user.id)
      .eq("bow_type", bowType)
      .eq("is_active", true)
      .limit(1);

    const setup = setups?.[0];
    if (!setup) { setMarks(null); return; }
    setSetupId(setup.id);

    const crawl = bowType === "Barebow" || bowType === "Longbow";
    setIsCrawl(crawl);

    const distances = roundDistances(roundName);
    if (!distances.length) { setMarks(null); return; }

    if (crawl) {
      const { data } = await supabase
        .from("crawl_marks")
        .select("*")
        .eq("setup_id", setup.id)
        .in("distance", distances);
      setMarks(distances.map(d => data?.find(m => m.distance === d) || { distance: d, _empty: true }));
    } else {
      const { data } = await supabase
        .from("sight_marks")
        .select("*")
        .eq("setup_id", setup.id)
        .in("distance", distances);
      setMarks(distances.map(d => data?.find(m => m.distance === d) || { distance: d, _empty: true }));
    }
  }

  async function saveNewMark(distance) {
    if (!setupId) return;
    setSaving(true);
    const vals = editing[distance] || {};

    if (isCrawl) {
      await supabase.from("crawl_marks").upsert({
        setup_id: setupId,
        distance,
        finger_position: vals.finger_position || "3 under",
        anchor: vals.anchor || "chin",
        tab_count: vals.tab_count ?? null,
      }, { onConflict: "setup_id,distance" });
    } else {
      await supabase.from("sight_marks").upsert({
        setup_id: setupId,
        distance,
        sight_number: vals.sight_number ?? null,
        extension_bar: vals.extension_bar ?? null,
      }, { onConflict: "setup_id,distance" });
    }

    setSaving(false);
    loadMarks();
    setEditing(prev => { const next = { ...prev }; delete next[distance]; return next; });
  }

  if (!marks || marks.length === 0) return null;

  const hasData = marks.some(m => !m._empty);
  const hasMissing = marks.some(m => m._empty);

  return (
    <div style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13, marginBottom: 4 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{isCrawl ? "Crawl marks" : "Sight marks"}</span>
        <span style={{ fontSize: 11, opacity: 0.5 }}>{bowType} setup</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {marks.map(m => (
          <div key={m.distance} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600, minWidth: 60 }}>{m.distance}</span>
            {m._empty ? (
              editing[m.distance] !== undefined ? (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {isCrawl ? (
                    <>
                      <select value={editing[m.distance]?.finger_position || "3 under"}
                        onChange={e => setEditing(prev => ({ ...prev, [m.distance]: { ...prev[m.distance], finger_position: e.target.value } }))}
                        style={{ fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
                        <option>3 under</option><option>split</option>
                      </select>
                      <select value={editing[m.distance]?.anchor || "chin"}
                        onChange={e => setEditing(prev => ({ ...prev, [m.distance]: { ...prev[m.distance], anchor: e.target.value } }))}
                        style={{ fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}>
                        <option>lip</option><option>chin</option>
                      </select>
                      <input type="number" step="0.5" placeholder="Tab #"
                        value={editing[m.distance]?.tab_count ?? ""}
                        onChange={e => setEditing(prev => ({ ...prev, [m.distance]: { ...prev[m.distance], tab_count: e.target.value ? parseFloat(e.target.value) : null } }))}
                        style={{ fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: 55 }} />
                    </>
                  ) : (
                    <>
                      <input type="number" step="0.1" placeholder="Sight #"
                        value={editing[m.distance]?.sight_number ?? ""}
                        onChange={e => setEditing(prev => ({ ...prev, [m.distance]: { ...prev[m.distance], sight_number: e.target.value ? parseFloat(e.target.value) : null } }))}
                        style={{ fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: 60 }} />
                      <input type="number" placeholder="Ext"
                        value={editing[m.distance]?.extension_bar ?? ""}
                        onChange={e => setEditing(prev => ({ ...prev, [m.distance]: { ...prev[m.distance], extension_bar: e.target.value ? parseInt(e.target.value) : null } }))}
                        style={{ fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: 40 }} />
                    </>
                  )}
                  <button onClick={() => saveNewMark(m.distance)} disabled={saving}
                    style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Save
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(prev => ({ ...prev, [m.distance]: {} }))}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px dashed var(--border)", background: "transparent", cursor: "pointer", color: "var(--foreground)", opacity: 0.6 }}>
                  + Set mark
                </button>
              )
            ) : isCrawl ? (
              <span style={{ opacity: 0.8 }}>
                {m.finger_position} · {m.anchor}{m.tab_count != null ? ` · ${m.tab_count} tabs` : ""}
              </span>
            ) : (
              <span style={{ opacity: 0.8 }}>
                {m.sight_number != null ? `Sight: ${m.sight_number}` : "—"}
                {m.extension_bar != null ? ` · Ext: ${m.extension_bar}` : ""}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
